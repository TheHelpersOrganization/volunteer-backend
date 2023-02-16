import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { ROLE } from '../../auth/constants/role.constant';
import { Account } from '../entities/account.entity';
import { AccountRepository } from './account.repository';

describe(AccountRepository.name, () => {
  let repository: AccountRepository;

  let dataSource: {
    createEntityManager: jest.Mock;
  };

  beforeEach(async () => {
    dataSource = {
      createEntityManager: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AccountRepository,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    repository = moduleRef.get<AccountRepository>(AccountRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Get user by id', () => {
    const currentDate = new Date();
    it('should call findOne with correct id', () => {
      const id = 1;

      const expectedOutput: Account = {
        id,
        name: 'Default User',
        username: 'default-user',
        password: 'random-password',
        roles: [ROLE.USER],
        isAccountDisabled: false,
        email: 'default-user@random.com',
        createdAt: currentDate,
        updatedAt: currentDate,
        articles: [],
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedOutput);
      repository.findById(id);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
    });

    it('should return user if found', async () => {
      const expectedOutput: Account = {
        id: 1,
        name: 'Default User',
        username: 'default-user',
        password: 'random-password',
        roles: [ROLE.USER],
        isAccountDisabled: false,
        email: 'default-user@random.com',
        createdAt: currentDate,
        updatedAt: currentDate,
        articles: [],
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedOutput);

      expect(await repository.findById(1)).toEqual(expectedOutput);
    });

    it('should throw NotFoundError when user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      try {
        await repository.findById(1);
      } catch (error) {
        expect(error.constructor).toBe(NotFoundException);
      }
    });
  });
});
