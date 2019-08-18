import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'select-squire';
  squareArray = [];
  ngOnInit(){
    for(let i=0;i<60;i++){
      this.squareArray.push(i)
    }
  }
  selectedData(e){
    console.log(e)
  }
}
