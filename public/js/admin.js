const deleteProduct = (btn) => {
    // btn is accessed the help of using 'this' in products
    const ProdId = btn.parentNode.querySelector("[name=productId]").value;
    const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

    fetch('/admin/product/' + ProdId, {
        method: "DELETE",
        headers : {
            'csrf-token': csrf
        }
    })
        .then(result => {
            console.log(result)
        })
        .catch(err => {
            console.log(err)
        })
}