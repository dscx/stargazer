const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", (accs) => {
	accounts = accs;
	owner = accounts[0];
});

it("can Create a Star", async () => {
	let tokenId = 1;
	let instance = await StarNotary.deployed();
	await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
	assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[1];
	let starId = 2;
	let starPrice = web3.utils.toWei(".01", "ether");
	await instance.createStar("awesome star", starId, { from: user1 });
	await instance.putStarUpForSale(starId, starPrice, { from: user1 });
	assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[1];
	let user2 = accounts[2];
	let starId = 3;
	let starPrice = web3.utils.toWei(".01", "ether");
	let balance = web3.utils.toWei(".05", "ether");
	await instance.createStar("awesome star", starId, { from: user1 });
	await instance.putStarUpForSale(starId, starPrice, { from: user1 });
	let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
	await instance.buyStar(starId, { from: user2, value: balance });
	let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
	let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
	let value2 = Number(balanceOfUser1AfterTransaction);
	assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[1];
	let user2 = accounts[2];
	let starId = 4;
	let starPrice = web3.utils.toWei(".01", "ether");
	let balance = web3.utils.toWei(".05", "ether");
	await instance.createStar("awesome star", starId, { from: user1 });
	await instance.putStarUpForSale(starId, starPrice, { from: user1 });
	let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
	await instance.buyStar(starId, { from: user2, value: balance });
	assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[1];
	let user2 = accounts[2];
	let starId = 5;
	let starPrice = web3.utils.toWei(".01", "ether");
	let balance = web3.utils.toWei(".05", "ether");
	await instance.createStar("awesome star", starId, { from: user1 });
	await instance.putStarUpForSale(starId, starPrice, { from: user1 });
	let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
	const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
	await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
	const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
	let value =
		Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
	assert.equal(value, starPrice);
});

it("can add the star name and star symbol properly", async () => {
	let instance = await StarNotary.deployed();
	let name = await instance._name.call().then(n => n)
	let symbol = await instance._symbol.call().then(n => n)
	assert.equal(name, 'Stargazer')
	assert.equal(symbol, 'STGZR')
});

it("lets 2 users exchange stars", async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[0];
	let user2 = accounts[1];
	let starId1 = 17;
	let starId2 = 18;
	await instance.createStar("user 1 awesome star", starId1, { from: user1 });
	await instance.createStar("user 2 cool star", starId2, { from: user2 });
	
	instance.exchangeStars(starId1, starId2);

	let star1Owner = await instance.ownerOf.call(starId1);
	let star2Owner = await instance.ownerOf.call(starId2);

	assert.equal(star1Owner, user2);
	assert.equal(star2Owner, user1);
});

it("lets a user transfer a star", async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[4];
	let user2 = accounts[5];
	let starId1 = 11;
	await instance.createStar("The best star to trasnfer", starId1, { from: user1 });
	await instance.transferStar(user2, starId1, {from: user1})
	let starOwner = await instance.ownerOf.call(starId1);
	assert.equal(starOwner, user2)
});

it("lookUptokenIdToStarInfo test", async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[4];
	let starId1 = 143;
	let name = 'Beeelguise'
	await instance.createStar(name, starId1, { from: user1 });
	let starName = await instance.lookUptokenIdToStarInfo(starId1);
	assert.equal(starName, name )
});
