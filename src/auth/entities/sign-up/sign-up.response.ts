import { Response } from '../response-entity';
import { SignUpEntity } from './sign-up.entity';


export class SignUpResponse extends Response(SignUpEntity) {}

