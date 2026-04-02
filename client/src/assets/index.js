// Import background images
import dashboardBg from './images/dashboard-bg.jpg';
import transactionsBg from './images/transactions-bg.jpg';
import investmentsBg from './images/investments-bg.jpg';
import goalsBg from './images/goals-bg.jpg';
import settingsBg from './images/settings-bg.jpg';
import loginBg from './images/login-bg.jpg';

// Create CSS variables for our background images
const setupBackgroundVariables = () => {
  const root = document.documentElement;
  root.style.setProperty('--dashboard-bg', `url(${dashboardBg})`);
  root.style.setProperty('--transactions-bg', `url(${transactionsBg})`);
  root.style.setProperty('--goals-bg', `url(${goalsBg})`);
  root.style.setProperty('--login-bg', `url(${loginBg})`);
  root.style.setProperty('--investments-bg', `url(${investmentsBg})`);
  root.style.setProperty('--settings-bg', `url(${settingsBg})`);
};

// Export background images and setup function
export const backgroundImages = {
    dashboard: dashboardBg,
    transactions: transactionsBg,
    investments: investmentsBg,
    goals: goalsBg,
    settings: settingsBg,
    login: loginBg
};

export { setupBackgroundVariables };