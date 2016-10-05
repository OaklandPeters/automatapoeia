/**
 *
 * This demonstrates how to construct an object that meets both a function interface
 * and a class-like interface at the same time.
 *
 * The trick is to use a IIFS when constructing the object, such as when constructing
 * MyType.
 */



interface MyInterface {
	// Function interface
    (x: string): string;
    // Class-like interface
    text2(content: string, additional: number);
    names: Array<string>;
}

var MyType = ((): MyInterface=>{
  var x:any = function():string { // Notice the any 
      return "Some string"; // Dummy implementation 
  }
  x.text2 = function(content:string){
      console.log(content); // Dummy implementation 
  }
  x.names = ['Foo', 'Bar', 'Baz'];
  return x;
}
)();

var functionCallResult = MyType('thing');
var methodResult = MyType.text2('more content', 5);
var useName = MyType.names[1];



