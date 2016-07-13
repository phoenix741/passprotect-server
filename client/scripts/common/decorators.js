export function property(target, name, descriptor) {
	target.prototype[name] = descriptor.initializer();
}
