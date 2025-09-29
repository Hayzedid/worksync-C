import fs from 'fs';
import path from 'path';

const NEWSLETTER_FILE = path.join(process.cwd(), 'data', 'newsletter-subscribers.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(NEWSLETTER_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load subscribers from file
export const loadSubscribers = (): string[] => {
  try {
    ensureDataDirectory();
    if (fs.existsSync(NEWSLETTER_FILE)) {
      const data = fs.readFileSync(NEWSLETTER_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading newsletter subscribers:', error);
  }
  return [];
};

// Save subscribers to file
export const saveSubscribers = (subscribers: string[]): void => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify(subscribers, null, 2));
  } catch (error) {
    console.error('Error saving newsletter subscribers:', error);
    throw error;
  }
};

// Add a new subscriber
export const addSubscriber = (email: string): boolean => {
  const subscribers = loadSubscribers();
  const normalizedEmail = email.toLowerCase().trim();
  
  if (subscribers.includes(normalizedEmail)) {
    return false; // Already exists
  }
  
  subscribers.push(normalizedEmail);
  saveSubscribers(subscribers);
  return true; // Successfully added
};

// Get all subscribers
export const getSubscribers = (): string[] => {
  return loadSubscribers();
};

// Get subscriber count
export const getSubscriberCount = (): number => {
  return loadSubscribers().length;
};

// Remove a subscriber (for unsubscribe functionality)
export const removeSubscriber = (email: string): boolean => {
  const subscribers = loadSubscribers();
  const normalizedEmail = email.toLowerCase().trim();
  const index = subscribers.indexOf(normalizedEmail);
  
  if (index === -1) {
    return false; // Not found
  }
  
  subscribers.splice(index, 1);
  saveSubscribers(subscribers);
  return true; // Successfully removed
};
