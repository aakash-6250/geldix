function showCreateForm() {
    document.getElementById("createProductForm").style.display = "block";
    document.getElementById("updateProductForm").style.display = "none";
    document.getElementById("allproducts").style.display = "none";
}

function showUpdateForm(x) {
    document.getElementById("updateProductForm").style.display = "block";
    document.getElementById("createProductForm").style.display = "none";
    document.getElementById("allproducts").style.display = "none";
    var productid = x;
    var form =document.getElementById("updateForm");
    form.action = `/api/update/${productid}`;
}

function deleteProduct(x) {
    var productid = x;
    fetch(`/api/delete/${productid}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(() => {
        allproducts();
    })
    .catch(error => {
        console.error('Error:', error);
    });

}

// document.getElementById('createForm').addEventListener('submit', function(event) {
//     event.preventDefault(); // Prevent default form submission
//     // Get form data
//     const formData = new FormData(this);

    // Make a POST request using fetch
//     fetch('/api/products', {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(data => {
//         // Handle successful response
//         console.log('Success:', data);
//         // Optionally, display a success message or perform other actions
//     })
//     .catch(error => {
//         // Handle errors
//         console.error('Error:', error);
//         // Optionally, display an error message or perform other actions
//     });
// });


// document.getElementById("updateForm").addEventListener("submit", function (event) {
//     event.preventDefault();
//     // Handle form submission for updating product
//     alert("Form submitted for updating product!");
// });

// document.getElementById("createForm").addEventListener("submit", function (event) {
//     event.preventDefault();
//     // Handle form submission for creating product
//     alert("Form submitted for creating product!");
// });

// document.getElementById("updateForm").addEventListener("submit", function (event) {
//     event.preventDefault();
//     // Handle form submission for updating product
//     alert("Form submitted for updating product!");
// });


async function allproducts () {
    await fetch('/products')
        .then(response => response.json())
        .then(data => {
            const productList = document.getElementById('productUl');
            productList.innerHTML = '';
            data.forEach(product => {
                const listItem = document.createElement('li');
                listItem.innerHTML += `
    <img src='${product.image}'>
    <h1>${product.productname}</h1>
    <p>${product.productdescription}</p>
    <div>
        <a onclick=showUpdateForm('${product._id}')>Update</a>
        <a onclick=deleteProduct('${product._id}')>Delete</a>
    </div>
`;
                productList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching data:', error));

        document.getElementById("updateProductForm").style.display = "none";
    document.getElementById("createProductForm").style.display = "none";
    document.getElementById("allproducts").style.display = "flex";
}

window.onload = allproducts;

