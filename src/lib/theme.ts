export const applyTheme = (theme: string) => {
  const root = window.document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // System preference
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

export const getStoredTheme = () => {
  return localStorage.getItem('dentallab-theme') || 'light';
};

export const setStoredTheme = (theme: string) => {
  localStorage.setItem('dentallab-theme', theme);
};
