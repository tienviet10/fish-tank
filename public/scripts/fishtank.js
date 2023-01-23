
class Fishtank {
  constructor(divName) {
    this.divName = divName;
    this.denizens = {};
    this.specieses = {};
    this.drawing = true;
    this.drawGraphicsBound = this.drawGraphics.bind(this);    // ahahaha, welcome to `this` hell.  callback hell never had it so fiery.
    requestAnimationFrame(this.drawGraphicsBound);
  }

  registerSpecies() {
    for (let species of arguments) {
      this.specieses[species.name] = species;
    }
  }

  getRandomSpecies() {
    let specieses = Object.values(this.specieses);
    let index = randRangeInt(specieses.length - 1);
    return specieses[index];
  }

  registerDenizen(individual) {
    let id;
    while (!id || this.denizens[id]) {
      id = Math.floor(Math.random() * 1000) + '';
    }
    this.denizens[id] = individual;
    return id;
  }

  getProximateDenizens(center, radius) {
    function isNearCenter(individual) {
      return individual.position.distance(center) <= radius;
      //return distance(individual.position, center) <= radius;
    }
    return Object.values(this.denizens).filter(isNearCenter);
  }

  removeDenizen(id, duration) {
    delete (this.denizens[id]);
    duration = duration || 1;
    duration = Number(duration) + 's';
    let $victim = $('#' + id);
    $victim.off();
    $victim.css({ transition: 'all ' + duration });
    $victim.css({
      opacity: '0',
      width: $victim.width() * 3,
      height: $victim.height() * 3,
    });
    setTimeout(() => $victim.remove(), 3000);
  }

  runPhysics(time) {
    let biteFishLocs = [];
    if (!time) {
      time = new Date();
    }

    for (let id in this.denizens) {
      if (this.denizens[id] instanceof BiteFish) biteFishLocs.push(new Vector(this.denizens[id].position.x, this.denizens[id].position.y));
    }

    for (let id in this.denizens) {
      let check = 0;
      const x = this.denizens[id].position.x;
      const y = this.denizens[id].position.y;

      if (!(this.denizens[id] instanceof Seed || this.denizens[id] instanceof Starter)) {
        for (let fishLoc of biteFishLocs) {
          if (fishLoc.distance({ x, y }) < 45 && this.denizens[id]?.update && !(this.denizens[id] instanceof BiteFish)) {
            this.denizens[id].update(time, true);
            check = 1;
            break;
          }
        }
      }

      if (this.denizens[id]?.update && check === 0) {
        this.denizens[id].update(time, false);
      }
    }
  }

  pause(doPause) {
    this.drawing = !doPause;
    if (this.drawing) {
      this.drawGraphics();
    }
  }

  unpause() {
    this.pause(false);
  }

  drawGraphics() {
    this.runPhysics();  // TODO: maybe this should be on a separate setInterval
    let $fishtank = $('#' + this.divName);
    let centerX = Math.floor(window.innerWidth / 2);
    let floorY = Math.floor(window.innerHeight * 0.95);
    for (let id in this.denizens) {
      let denizen = this.denizens[id];
      let renderRules = denizen.renderRules();
      let $denizen = $('#' + id);
      if ($denizen.length === 0) {
        $denizen = $(`<img id="${id}"></img>`);
        $denizen.css({ position: 'fixed' });
        $denizen.click(denizen.onClick);
        $fishtank.append($denizen);
      }

      if ($denizen.attr('src') !== renderRules.imageUri) {
        $denizen.attr('src', renderRules.imageUri);
      }

      if (renderRules.x !== undefined) {
        $denizen.css('left', renderRules.x + centerX);
      }
      if (renderRules.y !== undefined) {
        $denizen.css('bottom', renderRules.y + 10);
      }
      $denizen.css(renderRules.css);    // this is allowed to override the previous, if the Denizen wants to
    }

    if (this.drawing) {
      requestAnimationFrame(this.drawGraphicsBound);
    }
  }

  getBounds() {
    return {
      minX: - window.innerWidth / 2,
      maxX: window.innerWidth / 2,
      minY: -10,
      maxY: window.innerHeight - 10,
    };
  }

}

