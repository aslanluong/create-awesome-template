<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>Edit <code>components/HelloWorld.vue</code> and save to reload.</p>
    <a
      className="App-link"
      href="https://v3.vuejs.org/"
      target="_blank"
      rel="noopener noreferrer"
    >
      Learn Vue
    </a>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
