import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO, UserDTO } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ operationId: 'register' })
  @ApiOkResponse({ type: [UserDTO] })
  public register(@Body() createUserDTO: CreateUserDTO): Promise<UserDTO> {
    return this.usersService.register(createUserDTO);
  }

  @Post('login')
  @ApiOperation({ operationId: 'login' })
  @ApiOkResponse({ type: UserDTO })
  public login(@Body() loginUserDTO: LoginUserDTO): Promise<UserDTO> {
    return this.usersService.login(loginUserDTO);
  }

  @Get()
  @ApiOperation({ operationId: 'list' })
  @ApiOkResponse({ type: [UserDTO] })
  public findAll(): Promise<UserDTO[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ operationId: 'retrieve' })
  @ApiOkResponse({ type: UserDTO })
  public findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserDTO> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ operationId: 'update' })
  @ApiOkResponse({ type: UserDTO })
  public update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<UserDTO> {
    return this.usersService.update(id, updateUserDTO);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'delete' })
  @ApiOkResponse({ type: null })
  public delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.delete(id);
  }
}
