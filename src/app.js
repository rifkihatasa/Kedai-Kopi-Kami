document.addEventListener('alpine:init', () => {
    Alpine.data('products', () => ({
        items: [
            { id: 1, name:'Americano', img: '1.jpg.jpg', price: 20000 },
            { id: 2, name:'Coffe Latte', img: '2.jpg.jpeg', price: 20000 },
            { id: 3, name:'Espresso', img: '3.jpg.jpg', price: 20000 },
            { id: 4, name:'Cappucino', img: '4.jpg.jpeg', price: 17000 },
            { id: 5, name:'Mocha Latte', img: '5.jpg.jpg', price: 27000 },
            { id: 6, name:'Affogato Coffe', img: '/6.jpg.jpg', price: 25000 },
            { id: 7, name:'Macchiato Coffee', img: '7.jpg.jpg', price: 22000 },  
            { id: 8, name:'Hot Coffee', img: '8.jpg.jpg', price: 15000 },  
            { id: 9, name:'Black Coffe', img: '9.jpg.jpg', price: 15000 },  
        ],
    }));
    Alpine.store('cart', {
        items: [],
        total: 0,
        quantity: 0,
        add(newItem) {
            // cek apakah ada barang yang sama di cart
            const cartItem = this.items.find((item) => item.id === newItem.id);

            // jika belum ada atau cart masih kosong
            if(!cartItem) {
                this.items.push({...newItem, quantity: 1, total: newItem.price });
                this.quantity++;
                this.total += newItem.price;            
            } else {
            // jika barang sudah ada, cek apakah barang beda atau sama dengan yang ada di cart
            this.items = this.items.map((item) => {
                // jika barang berbeda
                if (item.id !== newItem.id) {
                    return item;
                } else {
                    // jika barang sudah ada, tambah quantity dan total
                    item.quantity++;
                    item.total = item.price * item.quantity;
                    this.quantity++;
                    this.total += item.price;
                    return item;
                }
            });
          }
        },
        remove(id) {
            // ambil item yang ini diremove berdasarkan id
            const cartItem = this.items.find((item) => item.id === id);

            // jika item lebih dari 1
            if(cartItem.quantity > 1) {
                // telusuri 1 1
                this.items = this.items.map((item) => {
                    // jika bukan barang yang dikilk
                    if(item.id !== id) {
                        return item;
                    } else {
                        item.quantity--;
                        item.total = item.price * item.quantity;
                        this.quantity--;
                        this.total -= item.price;
                        return item; 
                    }
                })
            } else if (cartItem.quantity === 1){
                // jika barang sisa 1
                this.items = this.items.filter((item) => item.id !== id);
                this.quantity--;
                this.total -= cartItem.price;
            }
        }
    });
});

// form validation
const checkoutButton = document.querySelector('.checkout-button');
checkoutButton.disabled = true;

const form = document.querySelector('#checkoutForm');

form.addEventListener('keyup', function() {
for(let i = 0; i < form.elements.length; i++) {
    if(form.elements[i].value.length !== 0) {
        checkoutButton.classList.remove('disabled');
        checkoutButton.classList.add('disabled');
            } else {
            return false;
        }
    }
    checkoutButton.disabled = false;
    checkoutButton.classList.remove('disabled');
});

// kirim data ketika tombol chekout diklik
checkoutButton.addEventListener('click', async function(e) {
e.preventDefault();
const formData = new FormData(form);
const data = new URLSearchParams(formData);
const objData = Object.fromEntries(data);
// const message = formatMessage(objData);
// window.open('https://wa.me/+6281649766023?text=' + encodeURIComponent(message));

// minta transaction token menggunakan ajax / fetch
try {
    const response = await fetch('php/placeOrder.php', {
        method: 'POST',
        body: data,
    });
    const token = await response.text();
    // console.log(token);
    window.snap.pay(token);
} catch (err) {
    console.log(err.message);
}
});

// format pesan whatsapp
const formatMessage = (obj) => {
    return `Data Customer
        Nama: ${obj.name}
        Email: ${obj.email}
        No HP: ${obj.phone}
Data Pesanan
    ${JSON.parse(obj.items).map((item) => `${item.name} (${item.quantity} x ${rupiah(item.total)}) \n`)}
TOTAL: ${rupiah(obj.total)}
Terima Kasih.`;
};

// konversi ke rupiah
const rupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number);
};