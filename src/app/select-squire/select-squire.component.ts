import { Component, OnInit, Input, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-select-squire',
  templateUrl: './select-squire.component.html',
  styleUrls: ['./select-squire.component.css']
})
export class SelectSquireComponent implements OnInit,OnDestroy {
  domOffsetX = null;
  domOffsetY = null;
  lineStyle = {};
  lineCopy = {};
  oldPosition = {};
  nowPosition = {};
  isMove:boolean = false;
  clickScroll = {};
  mouseMove=null;
  mouseUp=null;
  @Input() handleClass:string;
  @Input() scrollClass:string;
  @Input() allData
  @Output() selectedData = new EventEmitter<any>();
  @ViewChild("container",{static:true}) container;
  @ViewChild("box",{static:true}) box;
  constructor() { }

  ngOnInit() {
    // this.getAllOffset()
    this.bind()
    
  }
  ngOnDestroy(){
    this.mouseMove.unsubscribe();
    this.mouseUp.unsubscribe();
  }
  clickDown(e){
    this.getAllOffset();
    this.oldPosition = {
      x:e['pageX'],
      y:e['pageY']
    }
    if(!this.isMove){
      this.isMove = true;
      this.lineStyle = {
        top:"0px"
      }
    }
    // let scrollTop = this.container.nativeElement.scrollTop;
    // let scrollLeft = this.container.nativeElement.scrollLeft;
    // let scrollHeight = this.container.nativeElement.scrollHeight;
    let dom=this.checkScrollDom()['dom'];
    this.clickScroll = {
      top:dom.scrollTop,
      left:dom.scrollLeft,
      height:dom.scrollHeight,
      width:dom.scrollWidth
    }
    this.clearChild()
    this.pauseEvent(e)
  }
  bind(){
    this.mouseMove = fromEvent(document,"mousemove")
    .subscribe(e=>{
      this.clickMove(e)
    })
    this.mouseUp = fromEvent(document,"mouseup")
    .subscribe(e=>{
      // console.log("")
      this.clickUp(e)
    })
  }
  clickMove(e){
    if(this.isMove){
      this.nowPosition = {
        x:e['pageX'],
        y:e['pageY']
      }

      this.createFrame(this.oldPosition,this.nowPosition)
    }
  }
  createFrame(old,now){
    let dom = this.checkScrollDom()['dom'];
    let type = this.checkScrollDom()['type']
    // let scrollTop = this.container.nativeElement.scrollTop;
    // let scrollLeft = this.container.nativeElement.scrollLeft;
    let scrollTop = dom.scrollTop;
    let scrollLeft = dom.scrollLeft;
    if(now['y']>this.domOffsetY+dom.clientHeight&&type){
      now['y'] = this.domOffsetY+dom.clientHeight
    }else if(now['y']>this.domOffsetY+dom.clientHeight&&!type){
      now['y'] = dom.scrollHeight
    }
    if(now['x']>this.domOffsetX+dom.clientWidth&&type){
      now['x'] = this.domOffsetX+this.container.nativeElement.clientWidth
    }else if(now['x']>this.domOffsetX+dom.clientWidth&&!type){
      now['x'] = dom.clientWidth
    }
    let width;
    let height;
    let left;
    let top;
    if(type){
      width = Math.abs(now['x']-old['x'])+scrollLeft-this.clickScroll['left']
      height = Math.abs(now['y']-old['y'])+scrollTop-this.clickScroll['top']
    }else{
      width = Math.abs(now['x']-old['x'])+scrollTop;
      height = Math.abs(now['y']-old['y'])+scrollTop;
    }
    if(now['x']>old['x']){
      left = old['x']-this.domOffsetX+this.clickScroll['left'];
    }else{
      left = now['x']-this.domOffsetX+this.clickScroll['left'];
    }
    if(now['y']>old['y']){
      top = old['y']-this.domOffsetY+this.clickScroll['top'];
    }else{
      top = now['y']-this.domOffsetY+this.clickScroll['top'];
    }
    // if(height+top+50>this.container.nativeElement.clientHeight&&height+top<this.clickScroll['height']){
    //   this.container.nativeElement.scrollTop+=5;
    // }
    // if(left+width+50>this.container.nativeElement.clientWidth&&left+width<this.clickScroll['width']){
    //   this.container.nativeElement.scrollLeft+=5;
    // }
    if(height+top+50>dom.clientHeight&&height+top<this.clickScroll['height']&&type){
      dom.scrollTop+=5;
    }else if(height+top+50+this.domOffsetY>dom.clientHeight&&height+top<this.clickScroll['height']&&!type){
      console.log(dom,type)
      dom.scrollTop+=5;
    }
    if(left+width+50>dom.clientWidth&&left+width<this.clickScroll['width']&&type){
      dom.scrollLeft+=5;
    }else if(left+width+50>dom.clientWidth&&left+width<this.clickScroll['width']&&!type){
      dom.scrollTop+=5;
    }
    this.createLine(width,height,left,top)
  }
  createLine(width,height,left,top){//画线框
    this.lineStyle = {
      width:width+"px",
      height:height+"px",
      left:left+"px",
      top:top+"px"
    }
    this.lineCopy = {
      width:width,
      height:height,
      left:left,
      top:top
    }
  }
  clickUp(e){
    this.selectChild()
    this.isMove = false;
    this.reset()
  }
  getAllOffset(){//获取偏移量
    let dom = this.container.nativeElement
    let t = dom.offsetTop;
    let l = dom.offsetLeft;
    while(dom = dom.offsetParent){
      t+=dom.offsetTop;
      l+=dom.offsetLeft;
    }
    this.domOffsetX = t;
    this.domOffsetY = l;
  }
  pauseEvent(e){
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
  }
  reset(){
    this.lineStyle = {};
    this.lineCopy = {};
    this.oldPosition = {
      x:0,
      y:0
    }
    this.nowPosition = {
      x:0,
      y:0
    }
  }
  selectChild(){//选中被框选的元素
    let children=this.checkFather(this.handleClass);
    let data = []
    for(let i = 0;i<children.length;i++){
      if(children[i]['offsetLeft']+children[i]['clientWidth']>this.lineCopy['left']
      &&children[i]['offsetTop']+children[i]['clientHeight']>this.lineCopy['top']
      &&children[i]['offsetLeft']<(this.lineCopy['left']+this.lineCopy['width'])
      &&children[i]['offsetTop']<(this.lineCopy['top']+this.lineCopy['height'])){
        children[i].classList.add('select')
        data.push(this.allData[i])
      }
    }
    this.selectedData.emit(data)
  }
  checkFather(handleClass){//对框选的子集包裹元素做出判断
    let children;
    if(handleClass){
      children = document.getElementsByClassName(this.handleClass)[0].children;
    }else{
      children = this.box.nativeElement.children;
    }
    return children
  }
  clearChild(){//清除选中元素
    let children=this.checkFather(this.handleClass);
    
    for(let i = 0;i<children.length;i++){
      children[i].classList.remove('select')
    }
    
  }
  isScrollBar(dom){//判断是否有滚动条
    return dom['scrollHeight']>dom['clientHeight']
  }
  checkScrollDom(){//检测我们需要的滚动条
    let dom,type;
    if(this.scrollClass&&this.isScrollBar(document.getElementsByClassName(this.scrollClass)[0])){
      dom = document.getElementsByClassName(this.scrollClass)[0];
      type = 1;
    }else if(this.isScrollBar(this.container.nativeElement)){
      dom = this.container.nativeElement;
      type = 2;
    }else{
      dom = document.documentElement;
      type = 0
    }
    return {
      dom:dom,
      type:type
    }
  }
}
