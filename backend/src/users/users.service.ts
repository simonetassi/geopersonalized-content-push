import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from './dto';

@Injectable()
export class UsersService {
  public constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async register(createUserDTO: CreateUserDTO): Promise<User> {
    const user = await this.userRepository.findOneBy({
      username: createUserDTO.username,
    });

    if (user !== null) {
      throw new ConflictException(`Username is already taken`);
    }

    return this.userRepository.save(createUserDTO);
  }

  public async login(loginUserDTO: LoginUserDTO): Promise<User | null> {
    const user = await this.userRepository.findOneBy({
      username: loginUserDTO.username,
    });

    if (user === null) {
      throw new NotFoundException(`User not found`);
    }

    if (user.password !== loginUserDTO.password) {
      throw new UnauthorizedException(`Wrong password`);
    }

    return user;
  }

  public findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  public findOne(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async update(id: string, updateUserDTO: UpdateUserDTO): Promise<User> {
    const result = await this.userRepository.update(id, updateUserDTO);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.findOne(id);
  }

  public async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
