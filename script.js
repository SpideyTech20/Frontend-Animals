//const API = "http://localhost:3000/animals";
const API = "https://backend-animals-i5yl.onrender.com/animals";

const form = document.getElementById("animalForm");
const table = document.getElementById("animalTable");

const idInput = document.getElementById("animalId");
const nameInput = document.getElementById("name");
const legsInput = document.getElementById("numLegs");

loadAnimals();

async function loadAnimals(){

    const response = await fetch(API);

    const data = await response.json();

    table.innerHTML = "";

    data.animals.forEach(animal=>{

        table.innerHTML += `
        <tr>

            <td>${animal.id}</td>

            <td>${animal.name}</td>

            <td>${animal.numLegs}</td>

            <td>

                <button
                    class="edit"
                    onclick="editAnimal(${animal.id},'${animal.name}',${animal.numLegs})">

                    Edit

                </button>

                <button
                    class="delete"
                    onclick="deleteAnimal(${animal.id})">

                    Delete

                </button>

            </td>

        </tr>
        `;

    });

}

form.addEventListener("submit",async(e)=>{

    e.preventDefault();

    const animal={
        name:nameInput.value,
        numLegs:Number(legsInput.value)
    };

    if(idInput.value===""){

        await fetch(API,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(animal)
        });

    }else{

        await fetch(`${API}/${idInput.value}`,{
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(animal)
        });

    }

    form.reset();

    idInput.value="";

    loadAnimals();

});

function editAnimal(id,name,numLegs){

    idInput.value=id;

    nameInput.value=name;

    legsInput.value=numLegs;

}

async function deleteAnimal(id){

    if(!confirm("Delete this animal?")) return;

    await fetch(`${API}/${id}`,{
        method:"DELETE"
    });

    loadAnimals();

}