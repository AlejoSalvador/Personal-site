//I have determined the constant of some class function
 var li_items = document.querySelectorAll(".sidebar ul li");

 //here i need to add the list of the elements added previously in HTML
var sidebarElements=["grab", "cut", "sew", "increaseLength"];


var wrapper = document.querySelector(".wrapper");

//What will change if you move the mouse over the sidebar

li_items.forEach((li_item)=>{
	li_item.addEventListener("mouseenter", ()=>{
			mouseCurrentlyInterface=true;

			li_item.closest(".wrapper").classList.remove("hover_collapse");
      //I have already added style information about hover_collapse

	})
  //In general, hover_collapse will be applied on the sidebar.

//Hover_collapse will be removed from the sidebar when the mouse is moved
})

li_items.forEach((li_item)=>{
	li_item.addEventListener("mouseleave", ()=>{
		
		mouseCurrentlyInterface=false;
			li_item.closest(".wrapper").classList.add("hover_collapse");
      //Hover Collapse will be applied again when the mouse is removed

	})
})


//i will an event listener for mouse clicks

sidebarElements.forEach((sidebarElement)=>{
	document.querySelector('.'+sidebarElement).addEventListener("click", ()=>{
		currentTool=sidebarElement;
		document.querySelector(".selected").classList.remove("selected");
		document.querySelector('.'+sidebarElement).classList.add("selected");

      //Hover Collapse will be applied again when the mouse is removed

	})
})






//Now I will execute the menu button

//I have instructed here that hover_collapse will be applied and removed when the menu button is clicked.

//This means that the first click will be applied and the second click will be removed
