import { InferSubjects, Permissions } from 'nest-casl';
import { Action, Role } from 'src/auth/constants';
import { CreateOrganizationInputDto } from '../dtos';

export type Subjects = InferSubjects<typeof CreateOrganizationInputDto>;

export const OrganizationPermission: Permissions<Role, Subjects, Action> = {};
