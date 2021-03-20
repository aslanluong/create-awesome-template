import JSX = preact.JSX;

declare module "*.svg" {
  const content: any;
  export default content;
}
