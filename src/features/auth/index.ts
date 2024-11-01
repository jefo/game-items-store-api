import 'reflect-metadata';
import { IContainer, Registration as R } from "ts-ioc-container";
import { LoginCommand, LoginCommandType } from "./commands/login.cmd";
import { ChangePasswordCommand, ChangePasswordCommandType } from "./commands/change-password.cmd";
import { GetSessionQuery, GetSessionQueryType } from "./queries/get-session.query";

export function bindAuthModule(container: IContainer) {
  container.add(R.fromClass(LoginCommand).to(LoginCommandType));
  container.add(R.fromClass(ChangePasswordCommand).to(ChangePasswordCommandType));
  container.add(R.fromClass(GetSessionQuery).to(GetSessionQueryType));
}

// Export types and interfaces
export type { LoginDto, LoginResult } from './commands/login.cmd';
export type { ChangePasswordDto } from './commands/change-password.cmd';
export { LoginCommandType, ChangePasswordCommandType } from './commands/types';
export { GetSessionQueryType } from './queries/types';
