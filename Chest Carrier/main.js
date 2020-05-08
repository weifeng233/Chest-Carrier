Entity.getYaw = ModAPI.requireGlobal("Entity.getYaw");

//Data
var chestCarriers = {
	chest: 1,
	containers: {}
};

//Save & Read Data
Saver.addSavesScope("ChestCarrierScope",
	function read(scope) {
		chestCarriers.chest = scope.chest || 1;
		chestCarriers.containers = scope.containers || {};
	},
	function save() {
		return {
			chest: chestCarriers.chest,
			containers: chestCarriers.containers
		};
	}
);


//Create Item
Translation.addTranslation("Chest Carrier", {zh: "搬箱器", ru: "Ящик перевозчик"});
IDRegistry.genItemID("chestCarrier");
Item.createItem("chestCarrier", "Chest Carrier", {name: "chest_carrier", meta: 0}, {stack: 1});
Item.setToolRender(ItemID.chestCarrier, true);
Recipes.addShaped({id: ItemID.chestCarrier, data: 0, count: 1}, [["x x"], [" x "], [" x "]], ["x", 280, 0]);
Item.registerIconOverrideFunction("chestCarrier", function(item, name){
	return {name: "chest_carrier", meta: item.data?1:0};
});

//Save Chest & Place Chest
Callback.addCallback("ItemUse", function(coords, item, block){
	if(item.id == ItemID.chestCarrier){
		if(Entity.getSneaking(Player.get()) && !item.extra){
			if(block.id == 54 || block.id == 146){
				let chest = World.getContainer(coords.x, coords.y, coords.z);
				if(chest.size == 27){
					let container = [];
					for(let i=0; i<27; i++){
						slotItem = chest.getSlot(i);
						container.push({
						    "id": slotItem.id,
						    "count": slotItem.count,
						    "data": slotItem.data,
						    "extra": slotItem.extra
						});
						chest.setSlot(i, 0, 0, 0);
					}
					World.setBlock(coords.x, coords.y, coords.z, 0, 0);
					this.chestCarriers.containers["chest" + this.chestCarriers.chest] = container;
					let chestContainer = new ItemExtraData();
					chestContainer.putInt("block", block.id);
					chestContainer.putInt("container", this.chestCarriers.chest++);
					Player.setCarriedItem(item.id, 1, 1, chestContainer);
				}
			}
		}
		else if(item.extra){
			let rotation = Math.floor((Entity.getYaw(Player.get()) - 45) % 360 / 90);
			if(rotation < 0) rotation += 4;
			World.setBlock(coords.relative.x, coords.relative.y, coords.relative.z, item.extra.getInt("block"), [5, 3, 4, 2][rotation]);
			let chest = World.getContainer(coords.relative.x, coords.relative.y, coords.relative.z);
			for(let i=0; i<27; i++){
				let slotItem = this.chestCarriers.containers["chest" + item.extra.getInt("container")][i];
				if(getCoreAPILevel() > 8){
					chest.setSlot(i, slotItem.id, slotItem.count, slotItem.data, slotItem.extra);
				}
				else{
					chest.setSlot(i, slotItem.id, slotItem.count, slotItem.data);
				}
			}
			Player.setCarriedItem(item.id, 1, 0);
		}
	}
});