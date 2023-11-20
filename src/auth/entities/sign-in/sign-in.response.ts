import { Response } from '../response-entity';
import { SignInEntity } from './sign-in.entity';


export class SignInResponse extends Response(SignInEntity) {}

