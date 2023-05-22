/* Copyright 2019-2023 Appsmith */
package com.appsmith.server.services.ce;

import reactor.core.publisher.Mono;

public interface CaptchaServiceCE {

  Mono<Boolean> verify(String recaptchaResponse);
}
