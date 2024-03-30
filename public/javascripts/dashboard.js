function showCreateForm() {

    document.getElementById("createProductForm").style.display = "block";
    document.getElementById("updateProductForm").style.display = "none";
    document.getElementById("allproducts").style.display = "none";

}

document.getElementById('createForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);


    fetch('/api/add', {
        method: 'POST',
        body: formData,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            showMessage(data.message, 4000);
            document.getElementById('createForm').reset();
        })
        .catch(error => {
            console.error('Error:', error);
        });
});


async function showUpdateForm(productid) {
    document.getElementById("updateProductForm").style.display = "block";
    document.getElementById("createProductForm").style.display = "none";
    document.getElementById("allproducts").style.display = "none";
    var form = document.getElementById("updateForm");

    try {
        const response = await fetch(`/api/product/${productid}`);
        const product = await response.json();

        document.getElementById("updateproductname").value = product.name;
        document.getElementById("updateproductdescription").value = product.description;
        document.getElementById("updateproductid").value = product._id;
    } catch (error) {
        console.error('Error fetching product:', error);
    }
}

document.getElementById('updateForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const productid = formData.get('productid');
    fetch(`/api/update/${productid}`, {
        method: 'POST',
        body: formData,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            showMessage(data.message, 4000);
            document.getElementById('updateForm').reset();
            allproducts();
        })
        .catch(error => {
            console.error('Error:', error);
        });
});


function deleteProduct(productid) {
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
            const productList = document.getElementById('product-list');
            productList.innerHTML = '';

            if (data.length > 0) {
                data.forEach(product => {
                    const listItem = document.createElement('div');
                    listItem.className = 'product';
                    listItem.innerHTML += `
                        <div class="product-image"><img src='${product.image}'></div>
                        <div class="product-info">
                        <h1>${product.name}</h1>
                        <p>${product.description}</p>
                        </div>
                        <div class="product-controls">
                            <a onclick=showUpdateForm('${product._id}')>Update</a>
                            <a onclick=deleteProduct('${product._id}')>Delete</a>
                        </div>
                    `;
                    productList.appendChild(listItem);
                });
            } else {
                productList.innerHTML = '<div>No products found</div>';
            }
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

function showMessage(message, duration) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);

    setTimeout(() => {
        messageContainer.removeChild(messageElement);
    }, duration);
}


onload = allproducts;

