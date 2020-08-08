import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { mainReducer } from './main.reducer';

import { AppComponent } from './app.component';
import { MainViewComponent } from './main-view/main-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { EffectsModule } from '@ngrx/effects';
import { MainEffects } from './main.effects';
import { debug } from './debug.reducer';

@NgModule({
  declarations: [
    AppComponent,
    MainViewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    StorageServiceModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ScrollingModule,
    StoreModule.forRoot({ main: mainReducer }, { metaReducers: [debug]}),
    EffectsModule.forRoot([MainEffects]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
