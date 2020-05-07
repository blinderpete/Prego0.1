import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { CaptureComponent } from '../components/capture/capture.component';
import { RegistrationComponent } from '../components/registration/registration.component';
import { PaypalComponent } from '../components/paypal/paypal.component';
import { PinComponent } from '../components/pin/pin.component';

import { VisitorLogComponent } from '../components/visitor-log/visitor-log.component';

@NgModule({
  declarations: [CaptureComponent, RegistrationComponent, PaypalComponent,
    PinComponent, VisitorLogComponent
  ],
  entryComponents: [CaptureComponent, RegistrationComponent,PaypalComponent, 
    VisitorLogComponent, PinComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [CaptureComponent, RegistrationComponent, PaypalComponent, 
    VisitorLogComponent, PinComponent]
})
export class ComponentsModule { }