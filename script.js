const menu 					= document.getElementById("menu");
const addressInput 			= document.getElementById("address");
const addressWarn			= document.getElementById("address-warn");
let cart 					= [];


$(addressInput).on("input", (event) => {
	let inputValue = event.target.value;

	if (inputValue != "") {
		addressInput.classList.remove("border-red-500");
		addressWarn.classList.add("hidden");
	}
});


// Abri o Modal Do carrinho
function openCartModal(){
	updateCartModal();
	$("#cart-modal").css('display', 'flex');
}


function closeCartModal(){
	$("#cart-modal").css('display', 'none');
}


function assembleCart(){
	let parentButton = event.target.closest(".add-to-cart-btn");
	
	if (parentButton) {
		let name 	= parentButton.getAttribute("data-name");
		let price 	= parseFloat(parentButton.getAttribute("data-price"));
		let id 		= parseInt(parentButton.getAttribute("data-id"));

		addToCart(name, price, id);
	}

}


function alertNewProduct(name_product) {
	let isMobile = window.innerWidth <= 768;

	Toastify({
		text: name_product + " Adicionado ao carrinho",
		duration: 3000,
		close: true,
		gravity: "bottom",
		position: "right",
		stopOnFocus: true,
		style: {
			fontSize: isMobile ? "14px" : "16px", // Fonte menor no mobile.
			padding: isMobile ? "10px" : "15px", // Padding ajustado.
			borderRadius: "12px",
			background: "DarkOrange",
			color: "#000000",
		},
	}).showToast();
}


function addToCart(name, price, id) {
	let existingItem = cart.find((item) => item.name === name);

	if (existingItem) {
		existingItem.quantity += 1;
	} else {
		cart.push({
			name,
			price,
			quantity: 1,
			id,
		});
	}
	updateCartModal();
}


function updateCartModal() {
	let total = 0;

	$("#cart-items").text("");

	cart.forEach((item, index) => {
		const $cartItemElement	= $('<div>', {
												class: 'flex mb-4 flex-col justify-between'
											});
		
		const $content = $(`
			<div class="flex items-center justify-between mb-8"> 
				<div>
					<p class="font-bold mb-1">
						${item.name}
						<button type="button" class="btn-edit ml-2">Editar</button>      
					</p>
					<p>Quantidade: <span id="quantityProductsCartUpdated-${index}">${item.quantity}</span></p>
					<p class="font-medium">R$ ${item.price.toFixed(2)}</p>
				</div>
				<div class="flex items-center gap-5">
					<button type="button" class="fa-solid fa-minus btn-minus"></button>
					<input 
						type="number" 
						id="quantityProductsCart-${index}" 
						name="quantityProductsCart" 
						min="1" 
						max="99"
						value="${item.quantity}"
						class="form-control text-center"
					>
					<button type="button" class="fa-solid fa-plus btn-plus"></button>
				</div>
			</div>
		`);

		$content.find('.btn-edit').on('click', () => editItemModal(index));
		$content.find('.btn-minus').on('click', () => decreaseQuantity(index));
		$content.find('.btn-plus').on('click', () => increaseQuantity(index));
		$content.find('input[name="quantityProductsCart"]').on('change', () => updateQuantity(index));

		total += item.price * item.quantity;

		$cartItemElement.append($content);
		$("#cart-items").append($cartItemElement);
	});

	$("#cart-total").text(total.toLocaleString("pt-BR", {style: "currency", currency: "BRL"}));
	$("#cart-count").text(cart.reduce((acc, item) => acc + item.quantity, 0));
}


function editItemModal(index) {
	let item = cart[index];

	$("#modalItemName").text(item.name);
	$("#modalItemQuantity").val(item.quantity);

	$("#editModal").removeClass("hidden");
	$("#editModal").addClass("flex");
}


function closeModal() {
	$("#editModal").addClass("hidden");
}


// Diminuir a quantidade
function decreaseQuantity(index) {
	if (cart[index].quantity > 1) {
		cart[index].quantity -= 1;
		updateCartModal();
	}
}


// Aumentar a quantidade
function increaseQuantity(index) {
	cart[index].quantity += 1;
	updateCartModal();
}


// Atualizar a quantidade no input 
function updateQuantity(index) {
	let quantityInput 	= document.getElementById(`quantityProductsCart-${index}`);
	let newQuantity 	= parseInt(quantityInput.value, 10);

	if (newQuantity >= 1) {
		cart[index].quantity = newQuantity;
		updateCartModal();
	} else {
		quantityInput.value = 1;
		cart[index].quantity = 1;
		updateCartModal();
	}
}


function removeCartItem(name) {
	let index = cart.findIndex((item) => item.name === name);

	if (index !== -1) {
		let item = cart[index];

		if (item.quantity > 1) {
			item.quantity -= 1;
			updateCartModal();
			return;
		}

		cart.splice(index, 1);
		updateCartModal();
	}
}


// Finalizar pedido
function finishOrder(){
	const isMobile = window.innerWidth <= 768;
	if (!checkOpenRestaurant) {
		Toastify({
			text: "Ops, estabelecimento fechado no momento!",
			duration: 3000,
			close: true,
			gravity: "top",
			position: "right",
			stopOnFocus: true,
			style: {
				fontSize: isMobile ? "14px" : "16px", // Fonte menor no mobile.
				padding: isMobile ? "10px" : "15px", // Padding ajustado.
				borderRadius: "15px",
				background: "#ef4444",
			},
		}).showToast();
		return;
	}

	if (cart.length == 0) return;

	if (addressInput.value == "") {
		addressWarn.classList.remove("hidden");
		addressInput.classList.add("border-red-500");
		return;
	}

	let cartInfo = cart
		.map((item) => {
			return `🛒 *${item.name}* \n Quantidade: ${item.quantity} \n Preço: R$${item.price}\n----------------------------`; 
		})
		.join("\n");
	
	let phone	= "16997466829";
	let total	= cart.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2)

	if (!Array.isArray(cartInfo)) {
		cartInfo = [];
	}
	
	cartInfo.push(`💵 *Total: * R$${total}`);
	cartInfo.push(`📍 *Endereço:* ${addressInput.value}`);

	let message	= encodeURIComponent(cartInfo);

	window.open(
		`https://wa.me/${phone}?text=${message}`,
		"_blank"
	);

	cart = [];
	updateCartModal();
}


function checkOpenRestaurant() {
	let hora 		= new Date().getHours();
	let isMobile	= window.innerWidth <= 768;

	return hora >= 10 && hora < 23;
}


if (!checkOpenRestaurant) {
	$("#date-span").removeClass("bg-red-500");
	$("#date-span").addClass("bg-green-600");
} else {
	$("#date-span").removeClass("bg-red-500");
	$("#date-span").addClass("bg-green-600");
}