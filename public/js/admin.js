const deleteProduct = (btn) => {
    // btn is accessed the help of using 'this' in products
    const ProdId = btn.parentNode.querySelector("[name=productId]").value;
    const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

    // element to be deleted around btn
    const productElement = btn.closest('article')

    fetch('/admin/product/' + ProdId, {
        method: "DELETE",
        headers : {
            'csrf-token': csrf
        }
    })
        .then(result => {
            return result.json()
        })
        .then(data => {
            console.log(data)
            // productElement.remove()
            productElement.parentNode.removeChild(productElement);
        })
        .catch(err => {
            console.log(err)
        })
}