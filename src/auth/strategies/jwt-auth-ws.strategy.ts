import authConfig from '@app/common/configs/subconfigs/auth.config';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { STRATEGY_JWT_AUTH_WEBSOCKET } from '../constants';

@Injectable()
export class WsJwtStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_JWT_AUTH_WEBSOCKET,
) {
  constructor(
    @Inject(authConfig.KEY) authConfigApi: ConfigType<typeof authConfig>,
  ) {
    super({
      jwtFromRequest: (handshake: any): string | null => {
        let token = handshake.auth.token;
        if (token == null) {
          token = ExtractJwt.fromAuthHeaderAsBearerToken()(handshake);
        }
        return token;
      },
      secretOrKey: authConfigApi.secret,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      return {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles,
      };
    } catch (error) {
      throw new WsException('Unauthorized access');
    }
  }
}
