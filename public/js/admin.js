const deleteProduct = (btn) => {
    // btn is accessed the help of using 'this' in products
    const ProdId = btn.parentNode.querySelector("[name=productId]").value;
    const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
    console.log(ProdId, csrf)
}