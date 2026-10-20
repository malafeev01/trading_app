import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { gridResponsiveMap, NzBreakpointService } from 'ng-zorro-antd/core/services';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResponsiveLayoutService {
  private readonly breakpointService = inject(NzBreakpointService);

  public readonly isMobile = toSignal(
    this.breakpointService
      .subscribe(gridResponsiveMap, true)
      .pipe(map((breakpoints) => !breakpoints.md)),
    { initialValue: false },
  );
}
