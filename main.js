var swing = require('swing');
var GitHub = require('github-api');

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('submit').addEventListener('click', function(e) {
    e.preventDefault();
    initRepo();
  });
});

function initRepo() {
  var gh, me, stack, repo, newLi, newImg, newH, newP, textnode, repoName, ghToken;

  ghToken = document.getElementById('token').value;
  repoName = document.getElementById('repo').value;

  gh = new GitHub({
    token: ghToken
  });

  me = gh.getUser();

  stack = swing.Stack({
    allowedDirections: [swing.Direction.LEFT, swing.Direction.RIGHT],
    throwOutConfidence: (xOffset, yOffset, element) => {
      const xConfidence = Math.min(Math.abs(xOffset) / element.offsetWidth * 1.3, 1);
      const yConfidence = Math.min(Math.abs(yOffset) / element.offsetHeight * 1.3, 1);
      return Math.max(xConfidence, yConfidence);
    }
  });

  me.getProfile(function(err, profile) {
    repo = gh.getRepo(profile.login, repoName);

    repo.listPullRequests().then(function(prs) {
      for (var i = 0; i < prs.data.length; i++) {
        newLi = document.createElement('li');
        newImg = document.createElement('div');
        newH = document.createElement('h2');
        newP = document.createElement('p');
        newLi.setAttribute('data-pr', prs.data[i].number);
        newImg.setAttribute('style', 'background-image: url("' + prs.data[i].user.avatar_url + '");');
        textnode = document.createTextNode(prs.data[i].title);
        newH.appendChild(textnode);
        textnode = document.createTextNode(prs.data[i].body);
        newP.appendChild(textnode);
        newLi.appendChild(newImg);
        newLi.appendChild(newH);
        newLi.appendChild(newP);
        document.getElementById('stack').appendChild(newLi);
      }

      [].forEach.call(document.querySelectorAll('.stack li'), function (targetElement) {
        stack.createCard(targetElement);

        targetElement.classList.add('in-deck');
      });

      stack.on('throwout', function (e) {
        e.target.classList.remove('in-deck');
        e.target.classList.add('dealt');

        if (e.throwDirection == swing.Direction.RIGHT) {
          repo.mergePullRequest(e.target.getAttribute('data-pr'));
        } else {
          repo.updatePullRequest(e.target.getAttribute('data-pr'), {
            state: 'closed'
          });
        }
      });
    });
  })
}
