// tailwind.config.test.js
import tailwindConfig from './tailwind.config';

describe('Tailwind CSS Configuration', () => {
  test('should have content array with specified patterns', () => {
    expect(tailwindConfig.content).toEqual([
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ]);
  });

  test('should have theme object with extend and colors properties', () => {
    expect(tailwindConfig.theme).toBeDefined();
    expect(tailwindConfig.theme.extend).toBeDefined();
    expect(tailwindConfig.theme.extend.colors).toEqual({
      "bg-color": "#4C4254",
      "app-orange": "#ED7B82",
      "modal-color": "#635971",
      "ban-color": "#C73F47",
      "app-pink": "#ED7B82",
      "text-input-bg": "#9D92AB",
    });
  });

  test('should have plugins array', () => {
    expect(tailwindConfig.plugins).toEqual([]);
  });
});
