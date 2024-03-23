const { reload } = require("pm2");

function showCreateForm() {

    document.getElementById("createProductForm").style.display = "block";
    document.getElementById("updateProductForm").style.display = "none";
    document.getElementById("allproducts").style.display = "none";

}

function showUpdateForm(x) {

    var productid = x;
    document.getElementById("updateProductForm").style.display = "block";
    document.getElementById("createProductForm").style.display = "none";
    document.getElementById("allproducts").style.display = "none";
    var form = document.getElementById("updateForm");
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


async function allproducts() {
    await fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            const productList = document.getElementById('productlist');
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

    document.getElementById("createProductForm").style.display = "none";
    document.getElementById("updateProductForm").style.display = "none";
    document.getElementById("allproducts").style.display = "block";
}

async function logout() {
    try {
        const response = await fetch('/api/logout');
        if (!response.ok) {
            throw new Error('Logout request failed');
        }
        location.reload();
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

window.onload = showCreateForm;

