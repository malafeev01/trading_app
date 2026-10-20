import { Component } from '@angular/core';

@Component({
  selector: 'app-widget-block',
  template: '<div class="widget-block"><ng-content /></div>',
  styleUrl: './widget-block.component.css',
})
export class WidgetBlockComponent {}
