import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user.entity';

@Injectable()
export class UserQueryRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getUserByUsername(username: string) {
    return this.userRepository.findOneBy({
      username,
    });
  }
}
