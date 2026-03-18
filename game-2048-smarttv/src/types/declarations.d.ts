interface TizenApplication {
  getCurrentApplication(): { exit(): void };
}

interface Window {
  tizen?: {
    application: TizenApplication;
  };
}

declare module "*.scss" {
  const content: any;
  export default content;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}
