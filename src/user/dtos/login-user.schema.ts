import { ApiProperty } from '@nestjs/swagger';

export class LoginUserSchema {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3NDgwMjM0OTksImV4cCI6MTc1MDcwMTg5OX0.gkyZGToX4VcJMMj3IjtBRQJdnYGiyha0MDpYtpODWfc',
  })
  accessToken: string;
}
