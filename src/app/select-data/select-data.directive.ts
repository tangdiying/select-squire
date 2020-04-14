import { Directive, OnInit, OnDestroy, AfterViewInit, ElementRef, ContentChild, Input, Output, EventEmitter, ViewChild, TemplateRef, HostListener, Renderer2 } from '@angular/core';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

@Directive({
  selector: '[appSelectData]'
})
export class SelectDataDirective implements OnInit,OnDestroy,AfterViewInit {
  el:ElementRef;//当前宿主
  domOffsetX = null;//当前宿主的离浏览器左侧偏移量
  domOffsetY = null;//当前宿主的离浏览器顶部偏移量
  lineStyle = {};//线框的样式
  lineCopy = {};//线框样式的副本
  oldPosition = {};//鼠标按下的坐标
  nowPosition = {};//鼠标按下之后移动之后再抬起的坐标
  isMove:boolean = false;//
  clickScroll = {};
  mouseMove=null;//鼠标移动事件
  mouseUp=null;//鼠标抬起事件
  scrollMove = {};
  scrollupdownIntervel = null;//框选时鼠标底部开启的定时器
  scrollleftrightInterval = null;//框选时鼠标在右边开启的定时器
  _handleDom = null;
  @Input() 
  set handleDom(e){//可供选择的容器
    if(e instanceof TemplateRef){
      this._handleDom = e.elementRef.nativeElement
    }else if(e instanceof ElementRef){
      this._handleDom = e.nativeElement;
    }else if(e){
      this._handleDom = document.getElementById(e)
    }else{
      this._handleDom = e;
    }
  };
  get handleDom(){
    return this._handleDom
  }
  @Input() scrollClass:string;//根据class获取滚动的容器
  @Input() allData;//数据源
  @Output() selectedData = new EventEmitter<any>();//选中数据之后暴露的接口
  @ViewChild("container",{static:true}) container;
  @ViewChild("box",{static:true}) box;
  @Input() childrenClass:string = "";//规定选中数据的容器
  destory$ = new Subject();
  line;
  constructor(el:ElementRef,private render2:Renderer2) { 
    this.el = el;
  }
  ngOnInit(): void {
    this.line = this.render2.createElement("div")
    this.render2.addClass(this.line,"line")
    this.render2.appendChild(this.el.nativeElement,this.line)
    this.render2.setStyle(this.line,"display","none")
  }
  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }
  ngAfterViewInit(): void {
    
  }
  //当鼠标事件按下时记录位置，同时触发鼠标移动事件和鼠标抬起事件
  @HostListener('mousedown',['$event'])
  onClick(e){
    if(e['button']==2){
      return;
    }
    console.log("mousedown")
    this.getAllOffset();
    this.oldPosition = {
      x:e['pageX'],
      y:e['pageY']
    }
    // if(!this.isMove){
      // this.isMove = true;
      this.render2.setStyle(this.line,"display","block")//框选弹框dom显示
      this.render2.setStyle(this.line,"top","0px")
    // }
    let dom=this.checkScrollDom()['dom'];
    this.clickScroll = {
      top:dom.scrollTop,
      left:dom.scrollLeft,
      height:dom.scrollHeight,
      width:dom.scrollWidth
    }
    this.clearChild()
    this.pauseEvent(e)
    this.bind()
  }
  //鼠标移动事件和鼠标抬起事件
  //onClick函数里面调用
  bind(){
    this.mouseMove = fromEvent(document,"mousemove")
    .pipe(takeUntil(this.destory$))
    .subscribe(e=>{
      console.log("move")
      this.clickMove(e)
    })
    this.mouseUp = fromEvent(document,"mouseup")
    .pipe(take(1))
    .subscribe(e=>{
      this.clickUp(e)
      console.log("mouseup")
      this.destory$.next()
    })
  }
  //鼠标移动事件里面包括画框逻辑，选中数据逻辑
  //bind里调用
  clickMove(e){
    // if(this.isMove){
      if(e['pageY']>this.nowPosition['y']){
        this.scrollMove['uptodown'] = true
      }else{
        this.scrollMove['uptodown'] = false
      }
      if(e['pageX']>this.nowPosition['x']){
        this.scrollMove['lefttoright'] = true
      }else{
        this.scrollMove['lefttoright'] = false
      }
      this.nowPosition = {
        x:e['pageX'],
        y:e['pageY']
      }

      this.createFrame(this.oldPosition,this.nowPosition)
      this.selectChild()
    // }
  }
  //画框逻辑
  //clickMove里调用
  createFrame(old,now){
    let dom = this.checkScrollDom()['dom'];
    let type = this.checkScrollDom()['type']
    if(type){
      this.handleOtherMove(old,now,dom)
    }else{
      this.handleBodyMove(old,now,dom)
    }
  }
  //在当前指定的范围或者指令宿主的范围框选
  //createFrame里调用
  handleOtherMove(old,now,dom){
    let scrollTop = dom.scrollTop;
    let scrollLeft = dom.scrollLeft;
    if(this.scrollupdownIntervel){//当鼠标接近框选范围的底部，页面内容自动进行滚动，利用定时器完成自动滚动的功能
      clearInterval(this.scrollupdownIntervel)
    }
    if(this.scrollleftrightInterval){
      clearInterval(this.scrollleftrightInterval)
    }
    if(now['y']>this.domOffsetY+dom.clientHeight){
      now['y'] = this.domOffsetY+dom.clientHeight
      this.scrollMove['uptodown'] = true;
    }
    if(now['x']>this.domOffsetX+dom.clientWidth){
      now['x'] = this.domOffsetX+dom.clientWidth
      this.scrollMove['lefttodown'] = true;
    }
    let width;
    let height;
    let left;
    let top;
    width = Math.abs(now['x']-old['x'])+Math.abs(scrollLeft-this.clickScroll['left'])//宽度等于新旧位置x坐标的绝对值
    height = Math.abs(now['y']-old['y'])+Math.abs(scrollTop-this.clickScroll['top'])//高度等于新旧位置y坐标的绝对值
    if(now['x']>old['x']){//水平正向框选
      left = old['x']-this.domOffsetX+this.clickScroll['left'];
    }else{//水平反向框选
      left = now['x']-this.domOffsetX+scrollLeft;
    }
    if(now['y']>old['y']){//竖直正向框选
      top = old['y']-this.domOffsetY+this.clickScroll['top'];
    }else{//竖直反向框选
      top = now['y'] - this.domOffsetY+scrollTop;
    }
    if(now['y'] >= this.domOffsetY+dom.clientHeight&&height+top<this.clickScroll['height']){//竖直部分已经滚至底部
      this.scrollupdownIntervel = setInterval(()=>{
        dom.scrollTo(dom.scrollLeft,dom.scrollTop+5);
        scrollTop = dom.scrollTop;
        height = Math.abs(now['y']-old['y'])+Math.abs(scrollTop-this.clickScroll['top'])
        this.createLine(width,height,left,top,dom)
        if(height+top+20>this.clickScroll['height']){
          clearInterval(this.scrollupdownIntervel)
        }
      },10)
    }
    if(now['y']<=this.domOffsetY+20){//竖直部分已经滚动至顶部
      this.scrollupdownIntervel = setInterval(()=>{
        dom.scrollTo(dom.scrollLeft,dom.scrollTop-5);
        scrollTop = dom.scrollTop;
        height = Math.abs(now['y']-old['y'])+Math.abs(scrollTop-this.clickScroll['top'])
        top = now['y'] - this.domOffsetY+scrollTop;
        this.createLine(width,height,left,top,dom)
        if(scrollTop==0){
          clearInterval(this.scrollupdownIntervel)
        }
      },10)
    }
    if(now['x'] >= this.domOffsetX+dom.clientWidth&&left+width<this.clickScroll['width']){//水平部分已经滚动至底部
      this.scrollleftrightInterval = setInterval(()=>{
        dom.scrollTo(dom.scrollLeft+5,dom.scrollTop);
        scrollLeft = dom.scrollLeft;
        width = Math.abs(now['x']-old['x'])+Math.abs(scrollLeft-this.clickScroll['left'])
        this.createLine(width,height,left,top,dom)
        if(left+width+20>this.clickScroll['width']){
          clearInterval(this.scrollleftrightInterval)
        }
      },10)
    }
    if(now['x']<this.domOffsetX+20){//水平部分已经滚动至顶部
      this.scrollleftrightInterval = setInterval(()=>{
        dom.scrollTo(dom.scrollLeft-5,dom.scrollTop);
        scrollLeft = dom.scrollLeft;
        width = Math.abs(now['x']-old['x'])+Math.abs(scrollLeft-this.clickScroll['left'])
        left = now['x']-this.domOffsetX+scrollLeft;
        this.createLine(width,height,left,top,dom)
        if(scrollLeft==0){
          clearInterval(this.scrollleftrightInterval)
        }
      },10)
    }
    if(now['x']<this.domOffsetX&&!this.scrollMove['lefttoright']){
      dom.scrollTo(dom.scrollLeft-5,dom.scrollTop);
    }
    // console.log(dom.clientHeight)
    this.createLine(width,height,left,top,dom)
  }
  //指令宿主并没有出现滚动条，在整个页面内框选，
  //createFrame里调用
  handleBodyMove(old,now,dom){
    let scrollTop = dom.scrollTop;
    let scrollLeft = dom.scrollLeft;
    if(now['y']>dom.scrollHeight){
      now['y'] = dom.scrollHeight
    }
    if(now['x']>dom.scrollWidth){
      now['x'] = dom.scrollWidth
    }
    let width;
    let height;
    let left;
    let top;
    width = Math.abs(now['x']-old['x'])
    height = Math.abs(now['y']-old['y'])
    if(now['x']>old['x']){//水平正向框选
      left = old['x']-this.domOffsetX;
    }else{//水平反向框选
      left = now['x']-this.domOffsetX;
    }
    if(now['y']>old['y']){//竖直正向框选
      top = old['y']-this.domOffsetY;
    }else{//竖直反向框选
      top = now['y']-this.domOffsetY;
    }
    if(height+top+50+this.domOffsetY>dom.clientHeight+dom.scrollTop&&height+top+this.domOffsetY<this.clickScroll['height']+2&&this.scrollMove['uptodown']){//向下滚动
      dom.scrollTo(dom.scrollLeft,dom.scrollTop+5)
    }
    if(now['y']-50<dom.scrollTop&&!this.scrollMove['uptodown']){//向上滚动
      dom.scrollTo(dom.scrollLeft,dom.scrollTop-5)
    }
    if(left+width+50+this.domOffsetX>dom.clientWidth+dom.scrollLeft&&left+width+this.domOffsetX<this.clickScroll['width']+2&&this.scrollMove['lefttoright']){//向右滚动
      dom.scrollTo(dom.scrollLeft+5,dom.scrollTop)
    }
    if(now['x']-50<dom.scrollLeft&&!this.scrollMove['lefttoright']){//向左滚动
      dom.scrollTo(dom.scrollLeft-5,dom.scrollTop)
    }
    
    this.createLine(width,height,left,top,dom)
  }
  //线框的位置
  //handleOtherMove和handleBodyMove里面调用
  createLine(width,height,left,top,dom){//画线框
    this.lineStyle = {
      width:width+"px",
      height:height+"px",
      left:left+"px",
      top:top+"px"
    }
    this.render2.setStyle(this.line,"width",width+'px')
    this.render2.setStyle(this.line,"height",height+'px')
    this.render2.setStyle(this.line,"left",left+'px')
    this.render2.setStyle(this.line,"top",top+'px')
    this.lineCopy = {
      width:width,
      height:height,
      left:left,
      top:top
    }
  }
  //键盘抬起事件，线框消失
  //bind里调用
  clickUp(e){
    this.selectChild()
    // this.isMove = false;
    this.render2.setStyle(this.line,"display","none")
    this.render2.setStyle(this.line,"width",0+'px')
    this.render2.setStyle(this.line,"height",0+'px')
    this.reset()
    if(this.scrollupdownIntervel){
      clearInterval(this.scrollupdownIntervel)
    }
    if(this.scrollleftrightInterval){
      clearInterval(this.scrollleftrightInterval)
    }
  }
  //获取当前指令宿主离浏览器的偏移量
  //onClick里调用
  getAllOffset(){
    let dom = this.el.nativeElement
    let t = dom.offsetTop;
    let l = dom.offsetLeft;
    while(dom = dom.offsetParent){
      t+=dom.offsetTop;
      l+=dom.offsetLeft;
    }
    this.domOffsetX = l;
    this.domOffsetY = t;
  }
  //取消冒泡和默认行为
  //onClick里面调用
  pauseEvent(e){
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
  }
  //重置线的位置
  //clickUp里面调用
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
  //选中被框选的元素
  //clickMove和clickUp里面调用
  selectChild(){
    let children=this.checkFather(this.handleDom);
    let data = []
    for(let i = 0;i<children.length;i++){
      if(children[i]==this.line){
        continue;
      }
      let child
      if(this.childrenClass&&children[i].querySelector(this.childrenClass)){
        child = children[i].querySelector(this.childrenClass)
      }else{
        child = children[i]
      }
      if(child['offsetLeft']+child['clientWidth']>this.lineCopy['left']
      &&child['offsetTop']+child['clientHeight']>this.lineCopy['top']
      &&child['offsetLeft']<(this.lineCopy['left']+this.lineCopy['width'])
      &&child['offsetTop']<(this.lineCopy['top']+this.lineCopy['height'])){
        child.classList.add('select')
        data.push(this.allData[i])
      }
    }
    console.log(data)
    this.selectedData.emit(data)
  }
  //对框选的子集包裹元素做出判断
  //selectChild和clearChild里调用
  checkFather(handleDom){
    let children;
    if(handleDom){
      children = this._handleDom.children;
    }else{
      children = this.el.nativeElement.children;
    }
    return children
  }
  //清除选中元素
  //onClick中调用
  clearChild(){
    let children=this.checkFather(this.handleDom);
    
    for(let i = 0;i<children.length;i++){
      children[i].classList.remove('select')
    }
    
  }
  //判断是否有滚动条
  //checkScrollDom里面调用
  isScrollBar(dom){
    if(dom['scrollHeight']>dom['clientHeight']){
      return true
    }else if(dom['scrollWidth']>dom['clientWidth']){
      return true
    }else{
      return false
    }
  }
  //检测我们需要的滚动条
  //onClick和createFrame里面调用
  checkScrollDom(){
    let dom,type;
    if(this.scrollClass&&this.isScrollBar(document.getElementsByClassName(this.scrollClass)[0])){
      dom = document.getElementsByClassName(this.scrollClass)[0];
      type = 1;
    }else if(this.isScrollBar(this.el.nativeElement)){
      dom = this.el.nativeElement;
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
