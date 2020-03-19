declare let tinymce: any;

const testSet = [
  'Zachary Hawkins',
  'Julie Chavez',
  'Randy Duncan',
  'Lisa Robinson',
  'Jacqueline Reynolds',
  'Paul Weaver',
  'Edward Gilbert',
  'Deborah Butler',
  'Carolyn Munoz',
  'Billy Ramirez',
  'Pamela Walsh',
  'Paul Wade',
  'Katherine Campbell'
];

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'acex code',
  toolbar: 'acex code',
  // toolbar_location: 'bottom',
  height: 600,
  acex: {
    fetch: (editor, pattern) => {
      return new tinymce.util.Promise(function (resolve) {
        const names = testSet.filter(function (name) {
          return name.toLowerCase().indexOf(pattern) !== -1;
        });

        const results = names.map(function (name) {
          return {
            value: name,
            text: name,
            meta: {
              isEmail: true,
              desc: name.replace(/\s/g, '') + '@test.cc'
            }
          };
        });
        resolve(results);
      });
    },
    onAction: (editor, autocompleteApi, rng, value, meta) => {
      editor.selection.setRng(rng);
      const insertText = '<a href="mailto:' + meta.desc + '"><span style="text-decoration-line: none;">@' + value + '</span></a>';
      editor.insertContent(insertText);
      autocompleteApi.hide();
    },
    init_instance_callback: function(editor) {
      editor.on('click', function(e) {
        console.log('click -- ' + e.name, e);
      });

      editor.getBody().addEventListener('click', function(e) {
        console.log('click2 -- ' + e.name, e);
      });
    }
  }
});

export {};
