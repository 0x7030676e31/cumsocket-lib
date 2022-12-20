const loggers = new Map<string, [boolean, number]>();

let format: boolean = true;
export function logFormatting(state: boolean): void {
  format = state;
}

export function register(id: string, state: boolean): void {
  loggers.set(id, [state, Date.now()]);
}

export function print(id: string, opt: { header?: string, message: string }): void {
  const entry = loggers.get(id);
  if (!entry || entry[0] === false) return;

  // If there are multiple loggers, display the id
  const dispId = loggers.size > 1 ? `{${id}} ` : "";

  // Calculate uptime
  let uptime = (Date.now() - entry[1]) / 1000;
  
  const hours: number = Math.floor(uptime / 3600);
  uptime -= hours * 3600;

  const minutes: number = Math.floor(uptime / 60);
  uptime -= minutes * 60;

  const seconds: number = uptime;
  const time = `${hours ? `${hours}h ` : ""}${minutes ? `${minutes}m ` : ""}${seconds.toFixed(3)}s`;

  // Colors used in formatting
  const reset = "\x1b[0m";
  const yellow = "\x1b[38;2;189;183;107m"
  const blue = "\x1b[38;2;65;105;225m";
  const green = "\x1b[38;2;50;205;50m";

  // Print the log
  if (format === false) console.log(`${dispId}(${time}) ${opt.header ? `[${opt.header}] ` : ""}${opt.message}`);
  else console.log(`${green}${dispId}${reset}(${yellow}${time}${reset}) ${opt.header ? `[${blue}${opt.header}${reset}] ` : ""}${opt.message}`);
}