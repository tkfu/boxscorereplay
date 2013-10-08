(function() {
  var Player, create_initial_list, formatted_pct, set_quarter_markers, shooting_stats_cell, stats_to_time, update_clock, update_overtime, update_stats, update_table, update_team_stats;

  formatted_pct = function(value) {
    if (isNaN(value)) {
      return ".000";
    }
    if (value >= 1) {
      return "1.000";
    } else {
      return value.toFixed(3).substr(1);
    }
  };

  Player = (function() {
    function Player(id, name, pts, oreb, dreb, ast, blk, stl, pf, to, fga2, fgm2, fga3, fgm3, fta, ftm) {
      this.id = id;
      this.name = name;
      this.pts = pts;
      this.oreb = oreb;
      this.dreb = dreb;
      this.ast = ast;
      this.blk = blk;
      this.stl = stl;
      this.pf = pf;
      this.to = to;
      this.fga2 = fga2;
      this.fgm2 = fgm2;
      this.fga3 = fga3;
      this.fgm3 = fgm3;
      this.fta = fta;
      this.ftm = ftm;
      this.pts = this.oreb = this.dreb = this.ast = this.blk = this.stl = this.pf = this.to = this.fga2 = this.fgm2 = this.fga3 = this.fgm3 = this.fta = this.ftm = 0;
    }

    Player.prototype.reb = function() {
      return this.oreb + this.dreb;
    };

    Player.prototype.points = function() {
      return (this.fgm3 * 3) + (this.fgm2 * 2) + (this.ftm * 1);
    };

    Player.prototype.fgpc = function() {
      return formatted_pct((this.fgm2 + this.fgm3) / (this.fga2 + this.fga3));
    };

    Player.prototype.fg3pc = function() {
      return formatted_pct(this.fgm3 / this.fga3);
    };

    Player.prototype.ftpc = function() {
      return formatted_pct(this.ftm / this.fta);
    };

    return Player;

  })();

  create_initial_list = function(data) {
    var filtered, id, list, player, team, _i, _len, _ref;
    list = {};
    _ref = data.players;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      team = _ref[_i];
      for (id in team) {
        player = team[id];
        filtered = data.events.filter(function(ev) {
          return ev.time <= 1440 && ev.player === id;
        });
        if (filtered.length > 0) {
          list[id] = {
            name: player.name,
            team: player.team
          };
        }
      }
    }
    return list;
  };

  stats_to_time = function(time, data) {
    var event, id, object, player, teams, _i, _len, _ref;
    teams = [{}, {}];
    if (time <= 1440) {
      for (id in initial_list) {
        player = initial_list[id];
        teams[player.team][id] = new Player(id, player.name);
      }
    }
    _ref = data.events;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      event = _ref[_i];
      if (event.time > time) {
        break;
      }
      if (teams[event.team] && teams[event.team][event.player]) {
        player = teams[event.team][event.player];
      } else {
        object = data.players[event.team][event.player];
        player = new Player(event.player, object.name);
        teams[event.team][event.player] = player;
      }
      switch (event.type) {
        case "dreb":
          player.dreb++;
          break;
        case "oreb":
          player.oreb++;
          break;
        case "assist":
          player.ast++;
          break;
        case "block":
          player.blk++;
          break;
        case "foul":
          player.pf++;
          break;
        case "to":
          player.to++;
          break;
        case "stl":
          player.stl++;
          break;
        case "fga3":
          player.fga3++;
          break;
        case "fga2":
          player.fga2++;
          break;
        case "fta":
          player.fta++;
          break;
        case "fgm3":
          player.fga3++;
          player.fgm3++;
          player.pts += 3;
          break;
        case "fgm2":
          player.fga2++;
          player.fgm2++;
          player.pts += 2;
          break;
        case "ftm":
          player.fta++;
          player.ftm++;
          player.pts += 1;
      }
    }
    return teams;
  };

  shooting_stats_cell = function(made, attempts) {
    return $("<td class=\"fraction\"><span title=\"" + (formatted_pct(made / attempts)) + "\">" + made + "/" + attempts + "</span></td>");
  };

  set_quarter_markers = function() {
    var max;
    max = $("#slider").slider("option", "max");
    $(".quarter-markers .q2").css('left', "" + (100 / (max / 720)) + "%");
    $(".quarter-markers .q3").css('left', "" + (100 / (max / 1440)) + "%");
    $(".quarter-markers .q4").css('left', "" + (100 / (max / 2160)) + "%");
    return $(".quarter-markers .ot").css('left', "" + (100 / (max / 2880)) + "%");
  };

  update_team_stats = function(team_stats, player) {
    team_stats.orebs += player.oreb;
    team_stats.drebs += player.dreb;
    team_stats.asts += player.ast;
    team_stats.stls += player.stl;
    team_stats.blks += player.blk;
    team_stats.pfs += player.pf;
    team_stats.tos += player.to;
    team_stats.ftm += player.ftm;
    team_stats.fta += player.fta;
    team_stats.fgm += player.fgm2 + player.fgm3;
    team_stats.fga += player.fga2 + player.fga3;
    team_stats.fgm3 += player.fgm3;
    return team_stats.fga3 += player.fga3;
  };

  update_table = function(time, data) {
    var stats, tbody;
    tbody = $("table#stats tbody").html("");
    stats = stats_to_time(time, data);
    stats.forEach(function(team, team_i) {
      var id, key, player, team_stats, team_tr, total_points, total_rebounds, tr, _i, _len, _ref;
      team_stats = {
        points: 0,
        orebs: 0,
        drebs: 0,
        rebs: 0,
        asts: 0,
        stls: 0,
        blks: 0,
        pfs: 0,
        tos: 0,
        ftm: 0,
        fta: 0,
        fgm: 0,
        fga: 0,
        fgm3: 0,
        fga3: 0
      };
      tbody.append("<tr class=\"header\"><td colspan=\"13\">" + data.teams[team_i] + " <span id=\"score-" + team_i + "\">&nbsp;</span></td></tr>");
      for (id in team) {
        player = team[id];
        total_points = player.points();
        total_rebounds = player.reb();
        update_team_stats(team_stats, player);
        team_stats.points += total_points;
        team_stats.rebs += total_rebounds;
        tr = $("<tr class=\"player\"></tr>");
        tr.append("<td class=\"string\">" + player.name + "</td>");
        tr.append("<td class=\"numeric\">" + total_points + "</td>");
        tr.append("<td class=\"numeric misc\">" + player.oreb + "</td>");
        tr.append("<td class=\"numeric misc\">" + player.dreb + "</td>");
        tr.append("<td class=\"numeric\">" + total_rebounds + "</td>");
        tr.append("<td class=\"numeric\">" + player.ast + "</td>");
        tr.append("<td class=\"numeric\">" + player.stl + "</td>");
        tr.append("<td class=\"numeric\">" + player.blk + "</td>");
        tr.append("<td class=\"numeric\">" + player.pf + "</td>");
        tr.append("<td class=\"numeric\">" + player.to + "</td>");
        tr.append("<td class=\"fraction align-right\"><span title=\"" + (player.fgpc()) + "\">" + (player.fgm2 + player.fgm3) + "/" + (player.fga2 + player.fga3) + "</span></td>");
        tr.append("<td class=\"fraction align-right\"><span title=\"" + (player.fg3pc()) + "\">" + player.fgm3 + "/" + player.fga3 + "</span></td>");
        tr.append("<td class=\"fraction align-right\"><span title=\"" + (player.ftpc()) + "\">" + player.ftm + "/" + player.fta + "</span></td>");
        tbody.append(tr);
      }
      team_tr = $("<tr class=\"team\"><td colspan=\"2\">&nbsp;</td></tr>");
      _ref = ["orebs", "drebs", "rebs", "asts", "stls", "blks", "pfs", "tos"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        team_tr.append("<td class=\"numeric " + (key === 'orebs' || key === 'drebs' ? "misc" : void 0) + "\">" + team_stats[key] + "</td>");
      }
      team_tr.append(shooting_stats_cell(team_stats.fgm, team_stats.fga));
      team_tr.append(shooting_stats_cell(team_stats.fgm3, team_stats.fga3));
      team_tr.append(shooting_stats_cell(team_stats.ftm, team_stats.fta));
      tbody.append(team_tr);
      return $("#score-" + team_i).html(team_stats.points);
    });
    return $("span[title]").each(function() {
      $(this).data('title', $(this).attr('title'));
      $(this).attr('title', '');
      $(this).mouseover(function() {
        var tooltip;
        tooltip = $("<span class=\"tooltip\">" + ($(this).data('title')) + "</span>");
        return $(this).after(tooltip);
      });
      return $(this).mouseout(function() {
        return $(".tooltip").remove();
      });
    });
  };

  update_clock = function(seconds) {
    var minutes_remaining_in_quarter, ot_period, ot_seconds, quarter, seconds_remaining_in_quarter;
    $("a#time").attr("href", "#" + seconds);
    if (seconds === 0) {
      quarter = "1Q";
      minutes_remaining_in_quarter = 12;
      seconds_remaining_in_quarter = 0;
    } else {
      if (seconds > 2880) {
        ot_seconds = seconds - 2880;
        ot_period = Math.ceil(ot_seconds / 300);
        seconds_remaining_in_quarter = (300 * ot_period) - ot_seconds;
        minutes_remaining_in_quarter = 0;
        while (seconds_remaining_in_quarter >= 60) {
          seconds_remaining_in_quarter -= 60;
          minutes_remaining_in_quarter++;
        }
        quarter = "" + (ot_period >= 2 ? ot_period : "") + "OT";
      } else {
        quarter = Math.ceil(seconds / 720);
        seconds_remaining_in_quarter = 720 - (seconds - ((quarter - 1) * 720));
        minutes_remaining_in_quarter = 0;
        while (seconds_remaining_in_quarter >= 60) {
          seconds_remaining_in_quarter -= 60;
          minutes_remaining_in_quarter++;
        }
        quarter = "" + quarter + "Q";
      }
    }
    seconds = seconds_remaining_in_quarter.toString().length === 1 ? "0" + seconds_remaining_in_quarter : seconds_remaining_in_quarter;
    return $("a#time").text("" + quarter + " " + minutes_remaining_in_quarter + ":" + seconds);
  };

  update_overtime = function(seconds) {
    var max, ot_period, ot_seconds;
    max = $("#slider").slider("option", "max");
    if (seconds === max && data.events[data.events.length - 1].time > seconds) {
      ot_seconds = seconds - 2880;
      ot_period = Math.ceil(ot_seconds / 300);
      $("#slider, .quarter-markers").addClass("overtime ot" + ot_period);
      if (!($(".quarter-markers .ot").length > 0)) {
        $(".quarter-markers").append($("<a class=\"ot\">OT</a>"));
      }
      $("#slider").slider("option", "max", max + 300);
      return set_quarter_markers();
    }
  };

  update_stats = function(ev, ui) {
    var seconds;
    seconds = ui.value;
    if (ev.type === "slidechange") {
      update_overtime(seconds);
    }
    update_table(seconds, window.data);
    return update_clock(seconds);
  };

  $(function() {
    var toggle_game_quality_indicators;
    toggle_game_quality_indicators = function(show) {
      if ($("#show-game-quality-scores").is(":checked")) {
        return $("li[data-game-quality]").each(function() {
          var css_class, num;
          num = $(this).data('game-quality');
          css_class = (function() {
            switch (false) {
              case !(num >= 40 && num <= 59):
                return 'good';
              case !(num >= 60 && num <= 69):
                return 'great';
              case !(num >= 70):
                return 'awesome';
              default:
                return 'average';
            }
          })();
          $(this).find('a').prepend($("<span class=\"quality-indicator " + css_class + "\">" + num + "</span>").hide());
          return $('.quality-indicator').fadeIn(250);
        });
      } else {
        return $(".quality-indicator").fadeOut(250, function() {
          return $(".quality-indicator").remove();
        });
      }
    };
    $("#show-game-quality-scores").change(toggle_game_quality_indicators);
    toggle_game_quality_indicators();
    if (window.data) {
      $("#slider").slider({
        min: 0,
        max: 2880,
        animate: true,
        range: 'min',
        slide: update_stats,
        change: update_stats
      });
      $("#slider").after($("<div class=\"quarter-markers\"><a href=\"#\" class=\"q2\">Q2</a><a class=\"q3\">Q3</a><a class=\"q4\">Q4</a></div>"));
      window.initial_list = create_initial_list(window.data);
      $("#slider").slider("option", "value", ((window.location.hash != null) && window.location.hash !== '' ? parseInt(window.location.hash.substr(1)) : 0));
      update_table($("#slider").slider("option", "value"), window.data);
      return set_quarter_markers();
    }
  });

}).call(this);
