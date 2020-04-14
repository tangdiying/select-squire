import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SelectSquireComponent } from './select-squire/select-squire.component';
import { SelectDataDirective } from './select-data/select-data.directive';
@NgModule({
  declarations: [
    AppComponent,
    SelectSquireComponent,
    SelectDataDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
