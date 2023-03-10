$(document).ready(
	async function () {
	const requestURL = 'http://149.56.77.89:3001/api/weapons';
	var request = new Request(requestURL);
	const response = await fetch(request);
	var productItem = await response.json();

	showProductGallery(productItem);
	showCartTable();
});

function addToCart(element) {
	var productParent = $(element).closest('div.product-item');
	var price = $(productParent).find('.price span').text();
	var productName = $(productParent).find('.productname').text();
	var quantity = $(productParent).find('.product-quantity').val();

	var cartItem = {
		productName: productName,
		price: price,
		quantity: quantity
	};
	var cartItemJSON = JSON.stringify(cartItem);
	var cartArray = new Array();
	if (sessionStorage.getItem('shopping-cart')) {
		cartArray = JSON.parse(sessionStorage.getItem('shopping-cart'));
	}
	cartArray.push(cartItemJSON);

	var cartJSON = JSON.stringify(cartArray);
	sessionStorage.setItem('shopping-cart', cartJSON);
	showCartTable();
	
}

function emptyCart() {
	if (sessionStorage.getItem('shopping-cart')) {
		// Clear JavaScript sessionStorage by index
		sessionStorage.removeItem('shopping-cart');
		showCartTable();
	}
}

function removeCartItem(index) {
	if (sessionStorage.getItem('shopping-cart')) {
		var shoppingCart = JSON.parse(sessionStorage.getItem('shopping-cart'));
		sessionStorage.removeItem(shoppingCart[index]);
		showCartTable();
	}
}
function showCartTable() {
	var cartRowHTML = "";
	var itemCount = 0;
	var grandTotal = 0;
	var price = 0;
	var quantity = 0;
	var subTotal = 0;


	if (sessionStorage.getItem('shopping-cart')) {
		var shoppingCart = JSON.parse(sessionStorage.getItem('shopping-cart'));
		itemCount = shoppingCart.length;
		shoppingCart.forEach(function (item) {
			var cartItem = JSON.parse(item);
			price = parseFloat(cartItem.price);
			quantity = parseInt(cartItem.quantity);
			discount = parseInt(cartItem.discount)
			subTotal = price * quantity

			cartRowHTML += "<tr>" +
				"<td class='text-right'>" + cartItem.productName + "</td>" +
				"<td class='text-right'>$ " + price.toFixed(2) + "</td>" +
				"<td class='text-right'>" + quantity + "</td>" +
				"<td class='text-right'>$ " + subTotal.toFixed(2) + "</td>" +
				"</tr>";

			grandTotal += subTotal;
		});
	}
	$('#cartTableBody').html(cartRowHTML);
	$('#itemCount').text(itemCount);
	$('#totalAmount').text("$" + grandTotal.toFixed(2));

	
}

function showProductGallery(product) {
	var productHTML = "";
	product.forEach(function (item) {
		productHTML += '<div class="product-item transition-all">' +
			'<div class="sm-w-full" style="color: #ffffff;width="600" cellpadding="0" cellspacing="0" role="presentation">' +
			'<tr>' +
			'<td class="sm-block sm-w-full group hover-cursor-pointer" style="padding-left: 10px; padding-right: 10px; text-align: center; vertical-align: top;" width="33.33333%" align="center" valign="top">' +
			'<div class="mask transition-all group-hover-bg-size-120" style="background-image: url("product-images/' + item.photo + '")>' +
			'<img src="https://res.cloudinary.com/maizzle/image/upload/v1541499909/remix/rdr2/mask-6.png" width="150" class="sm-w-full" style="position:absolute; border: 0; line-height: 100%; vertical-align: middle;">' +
			'<img src="' + item.photo + '" width="150" class="sm-w-full" style="border: 0; line-height: 100%; vertical-align: middle;">' +
			'</div>' +
			'</td>' +
			'<div class="productname">' + item.productName + '</div>' +
			'<div class="productname">' + item.quantidade + '</div>' +
			'<div class="price">$ <span>' + item.price + '</span></div>' +

			'<div class="cart-action">' +
			'<input type="text" class="product-quantity" name="quantity" value="1" size="2" />' +
			'<input type="submit" value="Adicionar" class="add-to-cart" onClick="addToCart(this)" />' +
			'</div>' +
			'</tr>' +
			'<tr>' +
			'<td height="32"></td>' +
			'</tr>' +
			'</div>' +
			'</div>';
		'<tr>'

	});
	$('#weapons-item-container').html(productHTML);
}

