
const app=document.getElementById("app");
const breadcrumb=document.getElementById("breadcrumb");
let DATA=null;
let path=[];

async function loadData(){
  try{
    const response=await fetch("data/bangladesh.json");
    if(!response.ok) throw new Error("Could not load JSON data.");
    DATA=await response.json();
    render();
  }catch(error){
    app.innerHTML=`<div class="error">Unable to load administrative data.<br>Please run the project through a local server.</div>`;
    console.error(error);
  }
}

function createButton(text,onClick){
  const button=document.createElement("button");
  button.textContent=text;
  button.addEventListener("click",onClick);
  return button;
}

function renderBreadcrumb(){
  breadcrumb.innerHTML="";
  breadcrumb.appendChild(createButton("Bangladesh",()=>{path=[];render();}));

  if(path.length){
    breadcrumb.append("›");
    const current=document.createElement("span");
    current.className="current";
    current.textContent=path[path.length-1]==="__divisions__"
      ?"8 Divisions":path[path.length-1];
    breadcrumb.appendChild(current);
  }
}

function createGrid(items,clickHandler,countFn){
  const grid=document.createElement("div");
  grid.className="grid";
  items.forEach((name,index)=>{
    const item=document.createElement("div");
    item.className="item";
    item.style.animationDelay=(index*35)+"ms";
    const count=countFn ? countFn(name) : null;
    item.innerHTML=`<strong>${name}</strong><small>${count ?? ""}</small>`;
    if(clickHandler) item.addEventListener("click",()=>clickHandler(name));
    grid.appendChild(item);
  });
  return grid;
}

function render(){
  if(!DATA) return;
  renderBreadcrumb();
  app.innerHTML="";

  const title=document.createElement("div");
  title.className="title";
  const h=document.createElement("h2");
  const p=document.createElement("p");
  title.append(h,p);
  app.appendChild(title);

  if(path.length===0){
    h.textContent="🇧🇩 Bangladesh";
    p.textContent="Click Bangladesh to reveal the 8 administrative divisions";

    const start=document.createElement("div");
    start.className="start";
    start.innerHTML="<div class='emoji'>🇧🇩</div><h3>Bangladesh</h3><span>Click to explore 8 divisions</span>";
    start.addEventListener("click",()=>{path=["__divisions__"];render();});
    app.appendChild(start);
    return;
  }

  if(path.length===1){
    h.textContent="8 Divisions";
    p.textContent="Choose a division to view its districts";
    const line=document.createElement("div");line.className="line";app.appendChild(line);

    const names=Object.keys(DATA.divisions);
    app.appendChild(createGrid(names,
      name=>{path=["__divisions__",name];render();},
      name=>`${DATA.divisions[name].length} Districts`
    ));
    return;
  }

  const division=path[1];
  const district=path[2];

  if(!district){
    h.textContent=`${division} Division`;
    p.textContent="Choose a district to view its upazilas";

    const back=createButton("← Back to Divisions",()=>{path=["__divisions__"];render();});
    back.className="back";
    app.appendChild(back);

    const line=document.createElement("div");line.className="line";app.appendChild(line);

    app.appendChild(createGrid(DATA.divisions[division],
      name=>{path=["__divisions__",division,name];render();},
      name=>{
        const count=(DATA.upazilas[name]||[]).length;
        return count ? `${count} Upazilas` : "Click to explore";
      }
    ));
    return;
  }

  h.textContent=`${district} District`;
  p.textContent=`Upazilas of ${district} District`;

  const back=createButton(`← Back to ${division} Division`,()=>{path=["__divisions__",division];render();});
  back.className="back";
  app.appendChild(back);

  const line=document.createElement("div");line.className="line";app.appendChild(line);

  const list=DATA.upazilas[district]||[];
  if(!list.length){
    const empty=document.createElement("div");
    empty.className="item";
    empty.innerHTML="<strong>Upazilas</strong><small>Data can be added in data/bangladesh.json</small>";
    app.appendChild(empty);
    return;
  }
  app.appendChild(createGrid(list,null,()=> "Upazila"));
}

loadData();
