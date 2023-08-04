import { Action, Role } from '@app/auth/constants';
import { InferSubjects, Permissions } from 'nest-casl';
import { CreateOrganizationInputDto } from '../dtos';

export type Subjects = InferSubjects<typeof CreateOrganizationInputDto>;

export const OrganizationPermission: Permissions<Role, Subjects, Action> = {};
