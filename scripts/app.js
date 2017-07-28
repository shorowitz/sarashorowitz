$(document).ready(function() {
  console.log('script is linked')
    $('#fullpage').fullpage({
        anchors:['home', 'about', 'skills', 'portfolio', 'contact'],
        slidesNavigation: true,
        menu: '#myMenu',
        scrollBar: true,
        fitToSection: false
    });

    checkLocation();

// inspired by: http://vallandingham.me/gates_bubbles/
// referenced : https://github.com/vlandham/gates_bubbles

  function checkLocation() {

    var margin = {top: 20, right: 20, bottom: 20, left: 0};

    var width = 800 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom,
      center = {
        "x": width / 2,
        "y": height / 2
      },
      types = {
        "admin": {x: width / 3, y: height / 2},
        "dev": {x: width / 2, y: height / 2},
        "writing": {x: 2 * width / 3, y: height / 2}
      },
      layoutGravity = -0.01,
      damper = 0.1,
      nodes = [];

  var colorScale = d3.scale.ordinal()
    .domain(["dev", "admin", "writing"])
    .range(["#57D2D9", "#E64B64","#FFAE3E"]);

  var maxAmount = d3.max(skillsData, function(d) {return  d.value; });

  var radiusScale = d3.scale.pow()
    .exponent(3)
    .domain([0, maxAmount])
    .range([10, 85]);

  skillsData.forEach(function(d, i) {
    var node;
    node = {
      id: i,
      name: d.name,
      type: d.type,
      radius: radiusScale(d.value),
      charge: radiusScale(d.value),
      x: parseInt(Math.random() * 10),
      y: parseInt(Math.random() * 10)
    }
      nodes.push(node);
    });

  tip = d3.tip()
      .attr('class', 'd3-tip')
      .html(function(d) {
        return "<span>" + d.name + "</span>"
      })

  function bubbles (skillsData) {
     svg = d3.select("#d3")
      .append("svg")
      .attr("class", "viz")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform","translate(" + margin.left  + "," + margin.top + ")")
      .call(tip)

    circles = svg.selectAll(".circles")
      .data(nodes)
      .attr("class", "circles")
    .enter().append("circle")
      .attr("r", function(d) {return d.radius})
      .attr("fill", function (d) { return colorScale(d.type); })
      .attr("opacity", "0.7")
      .attr("stroke-width", 2)
      .attr("stroke", function(d) { return d3.rgb(colorScale(d.type)).darker(); })
      .on('mouseenter', tip.show)
      .on('mouseout', tip.hide)

    circles.transition().duration(2000).attr("r", function(d) { return d.radius; })

  };

  function charge(d) {
    return -Math.pow(d.radius, 2.0) / 8
  }

  function start() {
    force = d3.layout.force()
      .nodes(nodes)
      .size([width, height])
    }

  function displayAll() {
    force.gravity(layoutGravity)
      .charge(charge)
      .on("tick", function(e) {
          circles.each(moveCenter(e.alpha))
            .attr("cx", function(d) {
              return d.x;
            })
            .attr("cy", function(d) {
              return d.y;
            });
        })
      force.start();
  }

  function displayTypes() {
    force.gravity(layoutGravity)
      .charge(charge)
      .on("tick", function(e) {
        circles.each(moveTypes(e.alpha))
          .attr("cx", function(d) {
            return d.x
          })
          .attr("cy", function(d) {
            return d.y
          })
      })
    force.start();
  }

  function moveCenter(e) {
    return function(d) {
      d.x = d.x + (center.x - d.x) * (damper + 0.02) * e;
      d.y = d.y + (center.y - d.y) * (damper + 0.02) * e;
    };
  }

  function moveTypes(e) {
    return function(d) {
      var target = types[d.type];
        d.x = d.x + (target.x - d.x) * (damper + 0.02) * e * 1.1
        d.y = d.y + (target.y - d.y) * (damper + 0.02) * e * 1.1
      }
  }

  function displayTypeLabels() {
    typesX = {"Operations/Administration": 160, "Development": width / 2, "Other": width - 160}
    typesData = d3.keys(typesX)
    typeLabels = svg.selectAll(".types")
      .data(typesData)

    typeLabels.enter().append("text")
      .attr("class", "types")
      .attr("x", function(d) {return typesX[d]} )
      .attr("y", 2)
      .attr("text-anchor", "middle")
      .text(function(d) {return d})
    }

  function hideTypes() {
    typeLabels = svg.selectAll(".types").remove()
  }

  function gravity(alpha) {
    return function(d) {
      d.y += (d.cy - d.y) * alpha;
      d.x += (d.cx - d.x) * alpha;
    };
  }

  function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function(d) {
      var r = d.radius + radius.domain()[1] + 6,
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + quad.point.radius + (d.color !== quad.point.color) * 6;
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }

  d3.selectAll(".type")
    .on("click", function(e) {
      displayTypes()
      displayTypeLabels()
    })

  var currentHash = location.hash;
  if ($(window).width() < 600) {

    if (currentHash === "#home" || "#skills") {
      bubbles(skillsData)
      start()
      displayAll()
    }
  } else if (currentHash === "#skills") {
    svg = d3.selectAll(".viz").remove()
    bubbles(skillsData)
    start()
    displayAll()
  }
}

window.onhashchange = checkLocation;

});
