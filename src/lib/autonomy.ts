import { AutonomyConfig, AutonomyPlan, UserProfile } from './types';
import { db } from './db';
import { EveningPlanner } from './planner';
import { sendSMS } from './sms';

export async function checkAndTriggerAutonomyPlans(): Promise<void> {
  const configs = await getAllEnabledAutonomyConfigs();
  const now = new Date();
  const today = now.getDay();
  const currentHour = now.getHours();

  for (const config of configs) {
    const shouldNotifyToday = config.schedule.daysOfWeek.some(targetDay => {
      const notifyDay = (targetDay - config.schedule.notifyDaysBefore + 7) % 7;
      return notifyDay === today;
    });

    if (!shouldNotifyToday) continue;

    const [notifyHour] = config.schedule.notifyTime.split(':').map(Number);
    if (currentHour !== notifyHour) continue;

    const targetDate = getNextTargetDate(config);
    const existingPlan = await db.get<AutonomyPlan>(`autonomy:plan:${config.userId}:${targetDate}`);
    if (existingPlan) continue;

    await createAutonomousPlan(config, targetDate);
  }
}

export async function createAutonomousPlan(
  config: AutonomyConfig,
  targetDate: string
): Promise<AutonomyPlan> {
  const userProfile = await db.get<UserProfile>(`user:${config.userId}`);
  const prompt = buildPromptFromConstraints(config, targetDate);

  const events: unknown[] = [];
  const planner = new EveningPlanner(
    (event) => events.push(event),
    userProfile || undefined
  );

  const plan = await planner.createPlan(prompt);

  const autonomyPlan: AutonomyPlan = {
    id: crypto.randomUUID(),
    configId: config.id,
    userId: config.userId,
    targetDate,
    status: plan.stops.length > 0 ? 'booked' : 'planning',
    plan,
    createdAt: new Date(),
  };

  await db.set(`autonomy:plan:${config.userId}:${targetDate}`, autonomyPlan, 604800);

  if (userProfile?.phone) {
    await sendAutonomyNotification(config, autonomyPlan, userProfile.phone);
  }

  return autonomyPlan;
}

async function sendAutonomyNotification(
  config: AutonomyConfig,
  autonomyPlan: AutonomyPlan,
  phone: string
): Promise<void> {
  const plan = autonomyPlan.plan;

  if (plan.stops.length === 0) {
    await sendSMS(phone, `Couldn't find anything great for ${autonomyPlan.targetDate}. I'll keep looking.`);
    return;
  }

  const dinner = plan.stops.find(s => s.type === 'dinner');
  const drinks = plan.stops.find(s => s.type === 'drinks');

  let message: string;

  switch (config.autonomyLevel) {
    case 'full_auto':
      message = `Your ${autonomyPlan.targetDate}:\n\n`;
      message += `${dinner?.time} - ${dinner?.restaurant.name}\n`;
      message += `${dinner?.restaurant.location.address}\n`;
      if (dinner?.booking.confirmationNumber) {
        message += `Conf: ${dinner.booking.confirmationNumber}\n`;
      }
      if (drinks) {
        message += `\n${drinks.time} - ${drinks.restaurant.name}\n`;
        message += `${drinks.walkingFromPrevious?.minutes || 5} min walk after dinner\n`;
      }
      message += `\nEnjoy. 🍽️`;
      break;

    case 'book_with_confirm':
      message = `Booked your ${autonomyPlan.targetDate}:\n\n`;
      message += `${dinner?.time} ${dinner?.restaurant.name}\n`;
      message += `${dinner?.restaurant.location.address}\n`;
      if (drinks) {
        message += `→ ${drinks.time} ${drinks.restaurant.name}\n`;
      }
      message += `\nLook good? Reply CANCEL if plans changed.`;
      break;

    case 'suggest':
      message = `Found something for ${autonomyPlan.targetDate}:\n\n`;
      message += `${dinner?.time} ${dinner?.restaurant.name}\n`;
      message += `${dinner?.restaurant.vibeMatchScore || 85}% your vibe\n`;
      if (drinks) {
        message += `+ ${drinks.restaurant.name} after\n`;
      }
      message += `\nWant it? Reply YES to book.`;
      break;
  }

  await sendSMS(phone, message);

  autonomyPlan.status = 'notified';
  autonomyPlan.notifiedAt = new Date();
  await db.set(`autonomy:plan:${config.userId}:${autonomyPlan.targetDate}`, autonomyPlan, 604800);
}

function buildPromptFromConstraints(config: AutonomyConfig, targetDate: string): string {
  const c = config.constraints;

  let prompt = `Plan dinner for ${c.partySize} on ${targetDate}`;

  if (c.neighborhoods.length > 0) {
    prompt += ` in ${c.neighborhoods.join(' or ')}`;
  }

  if (c.cuisinePreferences.length > 0) {
    prompt += `. Prefer ${c.cuisinePreferences.join(', ')}`;
  }

  if (c.cuisineExclusions.length > 0) {
    prompt += `. No ${c.cuisineExclusions.join(', ')}`;
  }

  prompt += `. Budget ${c.budgetPerPerson.min}-${c.budgetPerPerson.max} per person`;
  prompt += `. Time between ${c.timePreference.earliest} and ${c.timePreference.latest}`;

  if (c.includeDrinks) {
    prompt += `. Include drinks after`;
  }

  return prompt;
}

function getNextTargetDate(config: AutonomyConfig): string {
  const now = new Date();
  const today = now.getDay();

  for (const targetDay of config.schedule.daysOfWeek.sort()) {
    const daysUntil = (targetDay - today + 7) % 7 || 7;
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysUntil);
    return targetDate.toISOString().split('T')[0];
  }

  return now.toISOString().split('T')[0];
}

async function getAllEnabledAutonomyConfigs(): Promise<AutonomyConfig[]> {
  return [];
}

export async function getAutonomyConfig(userId: string): Promise<AutonomyConfig | null> {
  return db.get<AutonomyConfig>(`autonomy:config:${userId}`);
}

export async function saveAutonomyConfig(config: AutonomyConfig): Promise<void> {
  await db.set(`autonomy:config:${config.userId}`, config);
}
