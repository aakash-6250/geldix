function showCreateForm() {
    document.getElementById("createProductForm").style.display = "block";
    document.getElementById("updateProductForm").style.display = "none";
    document.getElementById("allproducts").style.display = "none";
}

function showUpdateForm() {
    document.getElementById("updateProductForm").style.display = "block";
    document.getElementById("createProductForm").style.display = "none";
    document.getElementById("allproducts").style.display = "none";
}

document.getElementById("createForm").addEventListener("submit", function (event) {
    event.preventDefault();
    // Handle form submission for creating product
    alert("Form submitted for creating product!");
});

document.getElementById("updateForm").addEventListener("submit", function (event) {
    event.preventDefault();
    // Handle form submission for updating product
    alert("Form submitted for updating product!");
});

document.getElementById("createForm").addEventListener("submit", function (event) {
    event.preventDefault();
    // Handle form submission for creating product
    alert("Form submitted for creating product!");
});

document.getElementById("updateForm").addEventListener("submit", function (event) {
    event.preventDefault();
    // Handle form submission for updating product
    alert("Form submitted for updating product!");
});


async function allproducts () {
    await fetch('/products')
        .then(response => response.json())
        .then(data => {
            const productList = document.getElementById('productUl');
            productList.innerHTML = '';
            data.forEach(product => {
                const listItem = document.createElement('li');
                listItem.innerHTML += `
    <img src="https://cdn01.pharmeasy.in/dam/products_otc/S31892/pharmeasy-fish-oil-1000mg-soft-gelatin-60-capsules-2-1707378524.jpg">
    <h1>${product.productname}</h1>
    <p>${product.productdescription}</p>
    <div>
        <a href="/updatebtn">Update</a>
        <a href="/deletebtn">Delete</a>
        <a href="/unlistbtn">Unlist</a>
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