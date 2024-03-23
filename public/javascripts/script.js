var menu = document.querySelector('#menuicon');
menu.addEventListener('click', function() {
    var menutl = gsap.timeline();
    if (menu.classList.contains('ri-menu-line')) {
        menu.classList.remove('ri-menu-line');
        menu.classList.add('ri-close-line');
        menutl.to('.ri-close-line', {
            rotate: 270
        });
    } else if (menu.classList.contains('ri-close-line')) {
        menutl.to('.ri-close-line', {
            rotate: 0
        }).add(() => {
            menu.classList.remove('ri-close-line');
            menu.classList.add('ri-menu-line');
        });
    }
});


// async function allproducts() {
//     await fetch('/api/products')
//         .then(response => response.json())
//         .then(data => {
//             const productList = document.getElementById('productlist');
//             productList.innerHTML = '';
//             data.forEach(product => {
//                 const listItem = document.createElement('li');
//                 listItem.innerHTML += `
//                     <img src='${product.image}'>
//                     <h1>${product.productname}</h1>
//                     <p>${product.productdescription}</p>
//                     <div>
//                         <a onclick=showUpdateForm('${product._id}')>Update</a>
//                         <a onclick=deleteProduct('${product._id}')>Delete</a>
//                     </div>
//                 `;
//                 productList.appendChild(listItem);
//             });
//         })
//         .catch(error => console.error('Error fetching data:', error));
// }