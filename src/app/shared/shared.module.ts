import { MaterialModule } from './material/material.module';
import { OmbdService } from './ombd/ombd.service';
import { NgModule } from '@angular/core';

@NgModule({
    imports: [MaterialModule],
    exports: [MaterialModule],
    providers: [OmbdService],
}) export class SharedModule {
}
